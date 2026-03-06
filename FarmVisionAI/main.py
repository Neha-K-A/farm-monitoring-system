"""
FarmVisionAI - Main Entry Point
===============================

Complete end-to-end farm vision system using IP camera.

Features:
- Real-time crop detection using YOLO v8
- Health classification (healthy, ripe, unripe, rotten, diseased)
- Live farm map generation with crop locations
- Real-time statistics and visualization
- Frame skipping for performance optimization
- Robust error handling and recovery

Supported Camera Types:
- IP Webcam (Android app) - http://IP:PORT/video
- RTSP streams - rtsp://IP:PORT/stream
- HTTP MJPEG streams - http://IP:PORT/?action=stream
- Any OpenCV-compatible video stream

Usage:
    python main.py
    
    Then enter your IP camera URL when prompted

Example URLs:
    - http://192.168.1.100:8080/video (IP Webcam app)
    - rtsp://192.168.1.100:554/stream (RTSP stream)
    - http://192.168.1.100:8080/?action=stream (Generic MJPEG)

Requirements:
- Python 3.8+
- IP camera on same network
- Clear network connection to camera

Author: FarmVisionAI Team
Version: 1.0.0

"""

import cv2
import json
import time
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List

# Import all modules
from camera.adb_camera import ADBCamera
from ai.detector import ObjectDetector, DetectionBuffer
from ai.health_classifier import HealthClassifier
from mapping.farm_mapper import FarmMapper
from mapping.grid_mapper import GridMapper
from utils.visualization import Visualizer
from utils.config import (
    YOLO_DEVICE, TARGET_FPS, FRAME_TIMEOUT,
    DETECTIONS_JSON, FARM_MAP_PNG, STATISTICS_JSON,
    SAVE_DETECTIONS, SAVE_FARM_MAP, SAVE_STATISTICS,
    MAP_WIDTH, MAP_HEIGHT, DEBUG_MODE,
    WINDOW_DETECTION, WINDOW_MAP,
    get_logger, print_config
)

logger = get_logger(__name__)

class FarmVisionAI:
    """
    Main FarmVisionAI system that orchestrates all components.
    """
    
    def __init__(self):
        """Initialize the complete system."""
        logger.info("Initializing FarmVisionAI System...")
        print_config()
        
        # Components
        self.camera = None
        self.detector = None
        self.health_classifier = None
        self.farm_mapper = None
        self.grid_mapper = None
        self.visualizer = None
        self.detection_buffer = DetectionBuffer()
        
        # Tracking
        self.frame_count = 0
        self.detection_count = 0
        self.start_time = time.time()
        self.is_running = False
        
        # FPS tracking
        self.fps_buffer = []
        self.max_fps_samples = 30
        
        logger.info("System initialized")
    
    def initialize_components(self) -> bool:
        """
        Initialize all system components.
        
        Returns:
            bool: True if all components initialized successfully
        """
        try:
            logger.info("=" * 50)
            logger.info("Initializing Components")
            logger.info("=" * 50)
            
            # 1. Initialize Camera
            logger.info("[1/5] Initializing Camera...")
            
            # Get camera URL from user if not provided
            camera_url = input(
                "Enter IP camera URL (e.g., http://192.168.1.100:8080/video or rtsp://...): "
            ).strip()
            
            if not camera_url:
                logger.error("Camera URL is required")
                return False
            
            self.camera = ADBCamera(camera_url=camera_url)
            
            if not self.camera.check_camera_available():
                logger.error("Camera is not accessible")
                logger.info("Common IP camera URLs:")
                logger.info("  - IP Webcam (Android): http://192.168.1.XXX:8080/video")
                logger.info("  - RTSP stream: rtsp://192.168.1.XXX:554/stream")
                logger.info("  - HTTP MJPEG: http://192.168.1.XXX:8080/?action=stream")
                return False
            
            logger.info("[OK] Camera connected")
            
            # 2. Initialize Detector
            logger.info("[2/5] Initializing Object Detector...")
            self.detector = ObjectDetector()
            logger.info("[OK] Detector loaded")
            
            # 3. Initialize Health Classifier
            logger.info("[3/5] Initializing Health Classifier...")
            self.health_classifier = HealthClassifier()
            logger.info("[OK] Health Classifier ready")
            
            # 4. Initialize Mappers
            logger.info("[4/5] Initializing Farm Mappers...")
            self.farm_mapper = FarmMapper(1280, 720, MAP_WIDTH, MAP_HEIGHT)
            self.grid_mapper = GridMapper(MAP_WIDTH, MAP_HEIGHT)
            logger.info("[OK] Farm Mappers initialized")
            
            # 5. Initialize Visualizer
            logger.info("[5/5] Initializing Visualizer...")
            self.visualizer = Visualizer(1280, 720)
            logger.info("[OK] Visualizer ready")
            
            logger.info("=" * 50)
            logger.info("All components initialized successfully!")
            logger.info("=" * 50)
            
            return True
            
        except Exception as e:
            logger.error(f"Initialization failed: {e}")
            self.cleanup()
            return False
    
    def start_camera(self) -> bool:
        """
        Start camera streaming.
        
        Returns:
            bool: True if camera started successfully
        """
        try:
            logger.info("Starting camera stream...")
            if not self.camera.start():
                logger.error("Failed to start camera")
                return False
            
            # Wait for first frame
            logger.info("Waiting for first frame...")
            start_wait = time.time()
            while not self.camera.has_frame():
                if time.time() - start_wait > FRAME_TIMEOUT:
                    logger.error("Timeout waiting for camera frames")
                    return False
                time.sleep(0.1)
            
            logger.info("[OK] Camera frame received")
            return True
            
        except Exception as e:
            logger.error(f"Error starting camera: {e}")
            return False
    
    def process_frame(self, frame: np.ndarray) -> Optional[List[Dict]]:
        """
        Process a single frame through the entire pipeline.
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            list: Detections with health classification
        """
        try:
            # Object detection
            detections = self.detector.detect(frame)
            
            if not detections:
                return []
            
            # Health classification
            detections = self.health_classifier.classify_batch(frame, detections)
            
            # Add to buffer
            for det in detections:
                self.detection_buffer.add_detection(det)
            
            return detections
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return []
    
    def update_maps(self, detections: List[Dict]) -> int:
        """
        Update farm maps with detections.
        
        Args:
            detections (list): Detected crops
            
        Returns:
            int: Number of crops added to map
        """
        try:
            added_count = 0
            
            for det in detections:
                try:
                    # Add to farm mapper
                    crop_record = self.farm_mapper.add_crop(
                        det,
                        det.get("center", (0, 0))
                    )
                    
                    # Add to grid mapper
                    if crop_record:
                        map_coords = crop_record.get("map_coords", (0, 0))
                        self.grid_mapper.add_crop(
                            map_coords,
                            det.get("class", "unknown"),
                            det.get("health", "unknown")
                        )
                        added_count += 1
                        
                except Exception as e:
                    logger.debug(f"Error adding crop to map: {e}")
                    continue
            
            return added_count
            
        except Exception as e:
            logger.error(f"Error updating maps: {e}")
            return 0
    
    def generate_farm_map(self) -> np.ndarray:
        """
        Generate the current farm map visualization.
        
        Returns:
            np.ndarray: Farm map image
        """
        try:
            # Create empty map
            farm_map = self.visualizer.create_farm_map(MAP_WIDTH, MAP_HEIGHT)
            
            # Draw crops on map
            for crop in self.farm_mapper.crops:
                map_coords = crop.get("map_coords", (0, 0))
                farm_map = self.visualizer.add_crop_to_map(
                    farm_map,
                    map_coords[0],
                    map_coords[1],
                    crop.get("health", "unknown"),
                    crop.get("class", "")
                )
            
            # Add legend
            farm_map = self.visualizer.add_legend_to_map(farm_map)
            
            # Add statistics
            stats = self.farm_mapper.get_crop_statistics()
            farm_map = self.visualizer.add_crop_count_to_map(farm_map, self.visualizer.statistics)
            
            return farm_map
            
        except Exception as e:
            logger.error(f"Error generating farm map: {e}")
            return np.zeros((MAP_HEIGHT, MAP_WIDTH, 3), dtype=np.uint8)
    
    def save_outputs(self, farm_map: np.ndarray):
        """
        Save detection results and farm map.
        
        Args:
            farm_map (np.ndarray): Farm map image
        """
        try:
            # Save detections JSON
            if SAVE_DETECTIONS:
                detections_data = self.farm_mapper.export_crop_data()
                with open(DETECTIONS_JSON, 'w') as f:
                    json.dump(detections_data, f, indent=2, default=str)
                logger.info(f"Saved detections to {DETECTIONS_JSON}")
            
            # Save farm map image
            if SAVE_FARM_MAP:
                cv2.imwrite(str(FARM_MAP_PNG), farm_map)
                logger.info(f"Saved farm map to {FARM_MAP_PNG}")
            
            # Save statistics
            if SAVE_STATISTICS:
                stats = {
                    "timestamp": datetime.now().isoformat(),
                    "total_frames": self.frame_count,
                    "total_detections": self.detection_count,
                    "crop_statistics": self.farm_mapper.get_crop_statistics(),
                    "grid_statistics": self.grid_mapper.get_statistics(),
                    "average_fps": np.mean(self.fps_buffer) if self.fps_buffer else 0
                }
                with open(STATISTICS_JSON, 'w') as f:
                    json.dump(stats, f, indent=2, default=str)
                logger.info(f"Saved statistics to {STATISTICS_JSON}")
                
        except Exception as e:
            logger.error(f"Error saving outputs: {e}")
    
    def log_statistics(self):
        """Log current system statistics."""
        elapsed = time.time() - self.start_time
        current_fps = self.frame_count / elapsed if elapsed > 0 else 0
        
        logger.info("=" * 50)
        logger.info("System Statistics")
        logger.info("=" * 50)
        logger.info(f"Frames Processed: {self.frame_count}")
        logger.info(f"Detections Found: {self.detection_count}")
        logger.info(f"Average FPS: {current_fps:.2f}")
        logger.info(f"Elapsed Time: {elapsed:.2f}s")
        
        crop_stats = self.farm_mapper.get_crop_statistics()
        logger.info(f"Total Crops: {crop_stats['total_detections']}")
        logger.info(f"  Healthy: {crop_stats['healthy']}")
        logger.info(f"  Ripe: {crop_stats['ripe']}")
        logger.info(f"  Unripe: {crop_stats['unripe']}")
        logger.info(f"  Rotten: {crop_stats['rotten']}")
        logger.info("=" * 50)
    
    def run(self):
        """
        Main execution loop.
        """
        try:
            # Initialize
            if not self.initialize_components():
                logger.error("Failed to initialize components")
                return
            
            # Start camera
            if not self.start_camera():
                logger.error("Failed to start camera")
                return
            
            self.is_running = True
            logger.info("Starting main processing loop...")
            logger.info(f"Target FPS: {TARGET_FPS}")
            logger.info(f"Press 'q' to quit, 's' to save outputs")
            
            frame_skip = 2
            skip_counter = 0
            
            while self.is_running:
                try:
                    frame_start = time.time()
                    
                    # Get frame
                    frame = self.camera.get_frame()
                    if frame is None:
                        time.sleep(0.01)
                        continue
                    
                    self.frame_count += 1
                    
                    # Skip frames for performance
                    skip_counter += 1
                    if skip_counter < frame_skip:
                        continue
                    skip_counter = 0
                    
                    # Process frame
                    detections = self.process_frame(frame)
                    self.detection_count += len(detections)
                    
                    # Update maps
                    self.update_maps(detections)
                    
                    # Visualize detections on camera frame
                    frame_vis = self.visualizer.draw_detections(frame, detections)
                    frame_vis = self.visualizer.draw_statistics(frame_vis)
                    
                    # Generate farm map
                    farm_map = self.generate_farm_map()
                    
                    # Display windows
                    cv2.imshow(WINDOW_DETECTION, frame_vis)
                    cv2.imshow(WINDOW_MAP, farm_map)
                    
                    # Handle keyboard input
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q'):
                        logger.info("Quit request received")
                        break
                    elif key == ord('s'):
                        logger.info("Save request received")
                        self.save_outputs(farm_map)
                        logger.info("Outputs saved successfully")
                    elif key == ord('c'):
                        logger.info("Clear map request")
                        self.farm_mapper.clear_all()
                        self.grid_mapper.clear()
                        logger.info("Maps cleared")
                    elif key == ord('p'):
                        logger.info("Print statistics request")
                        self.log_statistics()
                    
                    # Frame timing
                    frame_time = time.time() - frame_start
                    current_fps = 1.0 / frame_time if frame_time > 0 else 0
                    self.fps_buffer.append(current_fps)
                    if len(self.fps_buffer) > self.max_fps_samples:
                        self.fps_buffer.pop(0)
                    
                    # Target FPS regulation
                    sleep_time = max(0, (1.0 / TARGET_FPS) - frame_time)
                    time.sleep(sleep_time)
                    
                except KeyboardInterrupt:
                    logger.info("Keyboard interrupt received")
                    break
                except Exception as e:
                    logger.error(f"Error in main loop: {e}")
                    # Try to continue instead of crashing
                    continue
            
            # Final save
            logger.info("Saving final outputs...")
            farm_map = self.generate_farm_map()
            self.save_outputs(farm_map)
            
            # Final statistics
            self.log_statistics()
            
        except Exception as e:
            logger.error(f"Fatal error in main loop: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources."""
        logger.info("Cleaning up resources...")
        
        try:
            if self.camera:
                self.camera.stop()
            
            cv2.destroyAllWindows()
            
            logger.info("Cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

def main():
    """Entry point for the application."""
    try:
        system = FarmVisionAI()
        system.run()
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.error(f"Application error: {e}")
        raise

if __name__ == "__main__":
    main()

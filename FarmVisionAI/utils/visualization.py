"""
FarmVisionAI Visualization Module
==================================

Handles all visualization tasks including:
- Drawing bounding boxes and labels on frames
- Creating and updating the farm map
- Displaying real-time statistics
- Color-coded health indicators

"""

import cv2
import numpy as np
from typing import Dict, List, Tuple
from utils.config import (
    HEALTH_STATES, TEXT_FONT, TEXT_SCALE, TEXT_THICKNESS,
    TEXT_COLOR, BOX_THICKNESS, BOX_COLOR, DISPLAY_CONFIDENCE,
    DISPLAY_HEALTH, DISPLAY_CLASS, MAP_BACKGROUND_COLOR,
    MAP_GRID_COLOR, MAP_CROP_RADIUS, MAP_GRID_SIZE,
    get_logger
)

logger = get_logger(__name__)

class Visualizer:
    """
    Visualization handler for rendering detections and farm maps.
    """
    
    def __init__(self, frame_width: int, frame_height: int):
        """
        Initialize visualizer with frame dimensions.
        
        Args:
            frame_width (int): Frame width in pixels
            frame_height (int): Frame height in pixels
        """
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.statistics = {
            "total_detections": 0,
            "healthy": 0,
            "ripe": 0,
            "unripe": 0,
            "rotten": 0,
            "diseased": 0
        }
    
    def draw_detection(self,
                      frame: np.ndarray,
                      bbox: Tuple[int, int, int, int],
                      class_name: str,
                      confidence: float,
                      health: str) -> np.ndarray:
        """
        Draw a single detection on the frame.
        
        Args:
            frame (np.ndarray): Input frame
            bbox (tuple): Bounding box coordinates (x1, y1, x2, y2)
            class_name (str): Detected class name
            confidence (float): Detection confidence score
            health (str): Health classification
            
        Returns:
            np.ndarray: Frame with drawn detection
        """
        try:
            x1, y1, x2, y2 = bbox
            
            # Clip coordinates to frame bounds
            x1 = max(0, min(x1, self.frame_width - 1))
            y1 = max(0, min(y1, self.frame_height - 1))
            x2 = max(0, min(x2, self.frame_width - 1))
            y2 = max(0, min(y2, self.frame_height - 1))
            
            # Get health color
            box_color = HEALTH_STATES.get(health, BOX_COLOR)
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, BOX_THICKNESS)
            
            # Prepare label text
            label_parts = []
            if DISPLAY_CLASS:
                label_parts.append(class_name)
            if DISPLAY_CONFIDENCE:
                label_parts.append(f"{confidence:.2f}")
            if DISPLAY_HEALTH:
                label_parts.append(health)
            
            label = " | ".join(label_parts)
            
            # Calculate text background
            (text_width, text_height), baseline = cv2.getTextSize(
                label, TEXT_FONT, TEXT_SCALE, TEXT_THICKNESS
            )
            
            # Draw text background
            cv2.rectangle(
                frame,
                (x1, y1 - text_height - baseline - 5),
                (x1 + text_width + 5, y1),
                box_color,
                -1
            )
            
            # Draw text
            cv2.putText(
                frame,
                label,
                (x1 + 2, y1 - baseline - 3),
                TEXT_FONT,
                TEXT_SCALE,
                (255, 255, 255),
                TEXT_THICKNESS
            )
            
            return frame
            
        except Exception as e:
            logger.error(f"Error drawing detection: {e}")
            return frame
    
    def draw_detections(self,
                       frame: np.ndarray,
                       detections: List[Dict]) -> np.ndarray:
        """
        Draw all detections on the frame.
        
        Args:
            frame (np.ndarray): Input frame
            detections (list): List of detection dictionaries
            
        Returns:
            np.ndarray: Frame with all detections drawn
        """
        frame_copy = frame.copy()
        
        # Reset statistics
        self.statistics = {
            "total_detections": len(detections),
            "healthy": 0,
            "ripe": 0,
            "unripe": 0,
            "rotten": 0,
            "diseased": 0
        }
        
        # Draw each detection
        for det in detections:
            try:
                frame_copy = self.draw_detection(
                    frame_copy,
                    det["bbox"],
                    det["class"],
                    det["confidence"],
                    det["health"]
                )
                
                # Update statistics
                if det["health"] in self.statistics:
                    self.statistics[det["health"]] += 1
                    
            except Exception as e:
                logger.warning(f"Error drawing individual detection: {e}")
                continue
        
        return frame_copy
    
    def draw_statistics(self, frame: np.ndarray) -> np.ndarray:
        """
        Draw detection statistics on the frame.
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            np.ndarray: Frame with statistics overlay
        """
        try:
            # Create statistics text
            stats = [
                f"Total: {self.statistics['total_detections']}",
                f"Healthy: {self.statistics['healthy']}",
                f"Ripe: {self.statistics['ripe']}",
                f"Unripe: {self.statistics['unripe']}",
                f"Rotten: {self.statistics['rotten']}"
            ]
            
            # Draw statistics box
            y_offset = 30
            for i, stat in enumerate(stats):
                y_pos = y_offset + (i * 25)
                
                # Draw semi-transparent background
                cv2.rectangle(
                    frame,
                    (10, y_pos - 20),
                    (250, y_pos + 5),
                    (0, 0, 0),
                    -1
                )
                
                # Draw text
                cv2.putText(
                    frame,
                    stat,
                    (15, y_pos),
                    TEXT_FONT,
                    0.5,
                    (255, 255, 255),
                    1
                )
            
            return frame
            
        except Exception as e:
            logger.error(f"Error drawing statistics: {e}")
            return frame
    
    def create_farm_map(self, map_width: int, map_height: int) -> np.ndarray:
        """
        Create an empty farm map with grid.
        
        Args:
            map_width (int): Map width in pixels
            map_height (int): Map height in pixels
            
        Returns:
            np.ndarray: Farm map image
        """
        # Create blank image
        farm_map = np.full(
            (map_height, map_width, 3),
            MAP_BACKGROUND_COLOR,
            dtype=np.uint8
        )
        
        # Draw grid
        for x in range(0, map_width, MAP_GRID_SIZE):
            cv2.line(
                farm_map,
                (x, 0),
                (x, map_height),
                MAP_GRID_COLOR,
                1
            )
        
        for y in range(0, map_height, MAP_GRID_SIZE):
            cv2.line(
                farm_map,
                (0, y),
                (map_width, y),
                MAP_GRID_COLOR,
                1
            )
        
        # Draw border
        cv2.rectangle(
            farm_map,
            (0, 0),
            (map_width - 1, map_height - 1),
            (100, 100, 100),
            2
        )
        
        # Add title
        cv2.putText(
            farm_map,
            "Farm Map - Top-Down View",
            (20, 30),
            TEXT_FONT,
            0.8,
            (50, 50, 50),
            2
        )
        
        return farm_map
    
    def add_crop_to_map(self,
                       farm_map: np.ndarray,
                       x: int,
                       y: int,
                       health: str,
                       class_name: str = "") -> np.ndarray:
        """
        Add a crop marker to the farm map.
        
        Args:
            farm_map (np.ndarray): Farm map image
            x (int): X coordinate on map
            y (int): Y coordinate on map
            health (str): Health status
            class_name (str): Crop class name
            
        Returns:
            np.ndarray: Updated farm map
        """
        try:
            # Ensure coordinates are within bounds
            x = max(MAP_CROP_RADIUS, min(x, farm_map.shape[1] - MAP_CROP_RADIUS))
            y = max(MAP_CROP_RADIUS, min(y, farm_map.shape[0] - MAP_CROP_RADIUS))
            
            # Get color for health status
            color = HEALTH_STATES.get(health, (128, 128, 128))
            
            # Draw crop circle
            cv2.circle(
                farm_map,
                (int(x), int(y)),
                MAP_CROP_RADIUS,
                color,
                -1
            )
            
            # Draw border
            cv2.circle(
                farm_map,
                (int(x), int(y)),
                MAP_CROP_RADIUS,
                (0, 0, 0),
                1
            )
            
            # Add class label if provided
            if class_name:
                cv2.putText(
                    farm_map,
                    class_name[0].upper(),
                    (int(x) - 5, int(y) + 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.3,
                    (255, 255, 255),
                    1
                )
            
            return farm_map
            
        except Exception as e:
            logger.error(f"Error adding crop to map: {e}")
            return farm_map
    
    def add_legend_to_map(self, farm_map: np.ndarray) -> np.ndarray:
        """
        Add health legend to the farm map.
        
        Args:
            farm_map (np.ndarray): Farm map image
            
        Returns:
            np.ndarray: Updated farm map with legend
        """
        try:
            legend_x = farm_map.shape[1] - 200
            legend_y = farm_map.shape[0] - 150
            
            # Draw legend background
            cv2.rectangle(
                farm_map,
                (legend_x - 10, legend_y - 10),
                (farm_map.shape[1] - 10, farm_map.shape[0] - 10),
                (255, 255, 255),
                -1
            )
            
            # Draw legend border
            cv2.rectangle(
                farm_map,
                (legend_x - 10, legend_y - 10),
                (farm_map.shape[1] - 10, farm_map.shape[0] - 10),
                (0, 0, 0),
                1
            )
            
            # Legend title
            cv2.putText(
                farm_map,
                "Health Status",
                (legend_x, legend_y + 10),
                TEXT_FONT,
                0.4,
                (0, 0, 0),
                1
            )
            
            # Health status items
            y_offset = legend_y + 35
            for health, color in HEALTH_STATES.items():
                # Draw color circle
                cv2.circle(
                    farm_map,
                    (legend_x + 10, y_offset),
                    5,
                    color,
                    -1
                )
                
                # Draw health label
                cv2.putText(
                    farm_map,
                    health.capitalize(),
                    (legend_x + 25, y_offset + 4),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.3,
                    (0, 0, 0),
                    1
                )
                
                y_offset += 20
            
            return farm_map
            
        except Exception as e:
            logger.error(f"Error adding legend: {e}")
            return farm_map
    
    def add_crop_count_to_map(self,
                             farm_map: np.ndarray,
                             stats: Dict) -> np.ndarray:
        """
        Add crop count statistics to the farm map.
        
        Args:
            farm_map (np.ndarray): Farm map image
            stats (dict): Statistics dictionary
            
        Returns:
            np.ndarray: Updated farm map
        """
        try:
            # Statistics text
            text_list = [
                f"Total Crops: {stats.get('total_detections', 0)}",
                f"Healthy: {stats.get('healthy', 0)}",
                f"Rotten: {stats.get('rotten', 0)}"
            ]
            
            # Draw stats box
            x_pos = 20
            y_pos = 60
            
            cv2.rectangle(
                farm_map,
                (x_pos - 5, y_pos - 25),
                (x_pos + 180, y_pos + 65),
                (255, 255, 255),
                -1
            )
            
            cv2.rectangle(
                farm_map,
                (x_pos - 5, y_pos - 25),
                (x_pos + 180, y_pos + 65),
                (0, 0, 0),
                1
            )
            
            # Draw text
            for i, text in enumerate(text_list):
                cv2.putText(
                    farm_map,
                    text,
                    (x_pos, y_pos + (i * 20)),
                    TEXT_FONT,
                    0.4,
                    (0, 0, 0),
                    1
                )
            
            return farm_map
            
        except Exception as e:
            logger.error(f"Error adding crop count: {e}")
            return farm_map

class FrameBuffer:
    """
    Manages frame buffering and processing queue.
    """
    
    def __init__(self, buffer_size: int = 5):
        """
        Initialize frame buffer.
        
        Args:
            buffer_size (int): Maximum frames to buffer
        """
        self.buffer = []
        self.buffer_size = buffer_size
    
    def add_frame(self, frame: np.ndarray):
        """Add frame to buffer."""
        if len(self.buffer) >= self.buffer_size:
            self.buffer.pop(0)
        self.buffer.append(frame)
    
    def get_frame(self) -> np.ndarray:
        """Get oldest frame from buffer."""
        if len(self.buffer) > 0:
            return self.buffer.pop(0)
        return None
    
    def is_ready(self) -> bool:
        """Check if buffer has frames ready for processing."""
        return len(self.buffer) > 0
    
    def clear(self):
        """Clear all frames from buffer."""
        self.buffer = []

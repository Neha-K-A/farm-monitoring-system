"""
FarmVisionAI Object Detection Module
====================================

Handles YOLO v8 object detection for crop identification.
Features:
- Automatic model download
- GPU/CPU support
- Confidence filtering
- Real-time batch processing
- Bounding box conversion

"""

import cv2
import numpy as np
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from ultralytics import YOLO
from urllib.request import urlopen
import shutil
from utils.config import (
    YOLO_MODEL_PATH, YOLO_MODEL_URL, YOLO_MODEL_NAME,
    YOLO_DEVICE, YOLO_CONFIDENCE_THRESHOLD, YOLO_IOU_THRESHOLD,
    YOLO_IMAGE_SIZE, CROP_CLASSES, get_logger
)

logger = get_logger(__name__)

class ObjectDetector:
    """
    YOLO v8 based object detector for crop identification.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize object detector.
        
        Args:
            model_path (str, optional): Path to YOLO model file
        """
        self.model = None
        self.model_path = model_path or str(YOLO_MODEL_PATH)
        self.device = YOLO_DEVICE
        self.confidence_threshold = YOLO_CONFIDENCE_THRESHOLD
        self.iou_threshold = YOLO_IOU_THRESHOLD
        
        # Download model if not exists
        if not os.path.exists(self.model_path):
            logger.info(f"Model not found at {self.model_path}, downloading...")
            self._download_model()
        
        # Load model
        self._load_model()
    
    def _download_model(self):
        """Download YOLO model using Ultralytics."""
        try:
            logger.info(f"Downloading {YOLO_MODEL_NAME} from Ultralytics...")
            
            # Create models directory
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            # Use Ultralytics' built-in download (more reliable)
            from ultralytics import YOLO
            logger.info("Initializing Ultralytics YOLO (will download model)...")
            _ = YOLO(YOLO_MODEL_NAME)  # This will auto-download the model
            
            logger.info(f"Model downloaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to download model: {e}")
            logger.error("Please ensure internet connection is available.")
            logger.error("Model can be manually placed at: e:/Farm Monitoring System/FarmVisionAI/models/yolov8x.pt")
            raise
            raise
    
    def _load_model(self):
        """Load YOLO model."""
        try:
            logger.info(f"Loading YOLO model from {self.model_path}")
            
            # Load with Ultralytics
            self.model = YOLO(self.model_path)
            
            # Set device
            if self.device == "cpu":
                logger.info("Using CPU for inference")
            else:
                logger.info(f"Using GPU device: {self.device}")
            
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect objects in frame.
        
        Args:
            frame (np.ndarray): Input frame in BGR format
            
        Returns:
            list: List of detection dictionaries
        """
        if self.model is None:
            logger.error("Model not loaded")
            return []
        
        try:
            # Run inference
            results = self.model(
                frame,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                imgsz=YOLO_IMAGE_SIZE,
                device=self.device,
                verbose=False
            )
            
            # Parse results
            detections = self._parse_results(results[0], frame)
            
            return detections
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return []
    
    def _parse_results(self, result, frame: np.ndarray) -> List[Dict]:
        """
        Parse YOLO results into detection dictionaries.
        
        Args:
            result: YOLO result object
            frame (np.ndarray): Original frame
            
        Returns:
            list: List of parsed detections
        """
        detections = []
        frame_h, frame_w = frame.shape[:2]
        
        try:
            # Get boxes
            if result.boxes is None or len(result.boxes) == 0:
                return detections
            
            boxes = result.boxes
            
            for i, box in enumerate(boxes):
                try:
                    # Get box coordinates
                    coords = box.xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
                    x1, y1, x2, y2 = coords.astype(int)
                    
                    # Get class and confidence
                    class_id = int(box.cls)
                    confidence = float(box.conf)
                    
                    # Get class name from YOLO model
                    class_name = result.names.get(class_id, f"class_{class_id}")
                    
                    # Clamp coordinates to frame
                    x1 = max(0, min(x1, frame_w - 1))
                    y1 = max(0, min(y1, frame_h - 1))
                    x2 = max(0, min(x2, frame_w - 1))
                    y2 = max(0, min(y2, frame_h - 1))
                    
                    # Create detection dict
                    detection = {
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": (x1, y1, x2, y2),
                        "center": ((x1 + x2) // 2, (y1 + y2) // 2),
                        "area": (x2 - x1) * (y2 - y1),
                        "health": "unknown"  # Will be filled by health classifier
                    }
                    
                    detections.append(detection)
                    
                except Exception as e:
                    logger.debug(f"Error parsing individual box: {e}")
                    continue
            
            return detections
            
        except Exception as e:
            logger.error(f"Error parsing results: {e}")
            return []
    
    def detect_batch(self, frames: List[np.ndarray]) -> List[List[Dict]]:
        """
        Detect objects in multiple frames.
        
        Args:
            frames (list): List of frames
            
        Returns:
            list: List of detection lists
        """
        results = []
        for frame in frames:
            results.append(self.detect(frame))
        return results
    
    def get_model_info(self) -> Dict:
        """
        Get model information.
        
        Returns:
            dict: Model details
        """
        if self.model is None:
            return {}
        
        return {
            "model_name": YOLO_MODEL_NAME,
            "model_path": self.model_path,
            "device": self.device,
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "input_size": YOLO_IMAGE_SIZE
        }

class DetectionBuffer:
    """
    Manages detection history for tracking and smoothing.
    """
    
    def __init__(self, max_history: int = 100):
        """
        Initialize detection buffer.
        
        Args:
            max_history (int): Maximum detections to keep
        """
        self.history = []
        self.max_history = max_history
    
    def add_detection(self, detection: Dict):
        """Add detection to history."""
        self.history.append(detection)
        if len(self.history) > self.max_history:
            self.history.pop(0)
    
    def add_detections(self, detections: List[Dict]):
        """Add multiple detections."""
        for det in detections:
            self.add_detection(det)
    
    def get_history(self) -> List[Dict]:
        """Get all detections in history."""
        return self.history.copy()
    
    def get_unique_locations(self, distance_threshold: float = 50) -> List[Dict]:
        """
        Get unique detection locations by clustering.
        
        Args:
            distance_threshold (float): Minimum distance between clusters
            
        Returns:
            list: Unique detections
        """
        if not self.history:
            return []
        
        unique = []
        for detection in self.history:
            center = detection.get("center", (0, 0))
            
            # Check if close to existing unique detection
            is_new = True
            for unique_det in unique:
                unique_center = unique_det.get("center", (0, 0))
                distance = np.sqrt(
                    (center[0] - unique_center[0])**2 + 
                    (center[1] - unique_center[1])**2
                )
                
                if distance < distance_threshold:
                    is_new = False
                    # Update with higher confidence
                    if detection["confidence"] > unique_det["confidence"]:
                        unique_det = detection
                    break
            
            if is_new:
                unique.append(detection)
        
        return unique
    
    def clear(self):
        """Clear history."""
        self.history = []

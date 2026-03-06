"""
FarmVisionAI Farm Mapping Module
================================

Manages the complete farm mapping system including:
- Coordinate conversion and transformation
- Real-time farm map generation
- Crop location tracking
- Map visualization with health indicators

"""

import numpy as np
import cv2
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from utils.config import (
    MAP_WIDTH, MAP_HEIGHT, MAP_BACKGROUND_COLOR,
    REAL_WORLD_SCALE, get_logger
)

logger = get_logger(__name__)

class CoordinateConverter:
    """
    Converts between frame coordinates and farm map coordinates.
    """
    
    def __init__(self,
                 frame_width: int,
                 frame_height: int,
                 map_width: int,
                 map_height: int):
        """
        Initialize coordinate converter.
        
        Args:
            frame_width (int): Source frame width
            frame_height (int): Source frame height
            map_width (int): Target map width
            map_height (int): Target map height
        """
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.map_width = map_width
        self.map_height = map_height
        
        # Scale factors
        self.scale_x = map_width / frame_width
        self.scale_y = map_height / frame_height
        
        logger.info(f"CoordinateConverter initialized: {frame_width}x{frame_height} -> {map_width}x{map_height}")
    
    def frame_to_map(self, frame_coords: Tuple[int, int]) -> Tuple[int, int]:
        """
        Convert frame coordinates to map coordinates.
        
        Args:
            frame_coords (tuple): (x, y) in frame
            
        Returns:
            tuple: (x, y) on map
        """
        try:
            x, y = frame_coords
            
            # Scale coordinates
            map_x = int(x * self.scale_x)
            map_y = int(y * self.scale_y)
            
            # Clamp to map bounds
            map_x = max(0, min(map_x, self.map_width - 1))
            map_y = max(0, min(map_y, self.map_height - 1))
            
            return (map_x, map_y)
            
        except Exception as e:
            logger.error(f"Coordinate conversion error: {e}")
            return (0, 0)
    
    def map_to_frame(self, map_coords: Tuple[int, int]) -> Tuple[int, int]:
        """
        Convert map coordinates to frame coordinates.
        
        Args:
            map_coords (tuple): (x, y) on map
            
        Returns:
            tuple: (x, y) in frame
        """
        try:
            x, y = map_coords
            
            # Inverse scale
            frame_x = int(x / self.scale_x)
            frame_y = int(y / self.scale_y)
            
            # Clamp to frame bounds
            frame_x = max(0, min(frame_x, self.frame_width - 1))
            frame_y = max(0, min(frame_y, self.frame_height - 1))
            
            return (frame_x, frame_y)
            
        except Exception as e:
            logger.error(f"Inverse coordinate conversion error: {e}")
            return (0, 0)
    
    def get_real_world_distance(self, pixel_distance: float) -> float:
        """
        Convert pixel distance to real-world distance.
        
        Args:
            pixel_distance (float): Distance in pixels
            
        Returns:
            float: Distance in meters
        """
        # Average scale factor
        avg_scale = (self.scale_x + self.scale_y) / 2
        real_distance = pixel_distance / avg_scale * REAL_WORLD_SCALE
        return real_distance

class FarmMapper:
    """
    Main farm mapping system that tracks and visualizes crop locations.
    """
    
    def __init__(self,
                 frame_width: int,
                 frame_height: int,
                 map_width: int = MAP_WIDTH,
                 map_height: int = MAP_HEIGHT):
        """
        Initialize farm mapper.
        
        Args:
            frame_width (int): Camera frame width
            frame_height (int): Camera frame height
            map_width (int): Map width in pixels
            map_height (int): Map height in pixels
        """
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.map_width = map_width
        self.map_height = map_height
        
        # Initialize converter
        self.converter = CoordinateConverter(
            frame_width, frame_height,
            map_width, map_height
        )
        
        # Detection history
        self.crops = []  # List of detected crops with locations
        self.last_update_time = datetime.now()
        
        logger.info(f"FarmMapper initialized: {map_width}x{map_height}")
    
    def add_crop(self,
                 detection: Dict,
                 frame_center: Tuple[int, int]) -> Dict:
        """
        Add a detected crop to the farm map.
        
        Args:
            detection (dict): Detection dictionary with health and class info
            frame_center (tuple): Center coordinates in frame (x, y)
            
        Returns:
            dict: Crop record with map coordinates
        """
        try:
            # Convert to map coordinates
            map_coords = self.converter.frame_to_map(frame_center)
            
            # Check if crop already exists at this location
            crop_record = {
                "id": len(self.crops),
                "class": detection.get("class", "unknown"),
                "health": detection.get("health", "unknown"),
                "confidence": detection.get("confidence", 0.0),
                "frame_coords": frame_center,
                "map_coords": map_coords,
                "timestamp": datetime.now(),
                "bbox": detection.get("bbox"),
                "detection_data": detection
            }
            
            self.crops.append(crop_record)
            self.last_update_time = datetime.now()
            
            logger.debug(f"Added crop at map {map_coords}: {detection.get('class', 'unknown')}")
            
            return crop_record
            
        except Exception as e:
            logger.error(f"Error adding crop: {e}")
            return None
    
    def add_crops_batch(self, detections: List[Dict]) -> List[Dict]:
        """
        Add multiple detections to the farm map.
        
        Args:
            detections (list): List of detections
            
        Returns:
            list: Crop records
        """
        crop_records = []
        for det in detections:
            if "center" in det:
                record = self.add_crop(det, det["center"])
                if record:
                    crop_records.append(record)
        return crop_records
    
    def get_crop_statistics(self) -> Dict:
        """
        Get statistics about mapped crops.
        
        Returns:
            dict: Statistics
        """
        stats = {
            "total_crops": len(self.crops),
            "by_class": {},
            "by_health": {},
            "average_confidence": 0.0,
            "map_coverage": 0.0
        }
        
        if len(self.crops) == 0:
            return stats
        
        # Count by class
        for crop in self.crops:
            class_name = crop.get("class", "unknown")
            health = crop.get("health", "unknown")
            
            stats["by_class"][class_name] = stats["by_class"].get(class_name, 0) + 1
            stats["by_health"][health] = stats["by_health"].get(health, 0) + 1
        
        # Average confidence
        confidences = [crop.get("confidence", 0.0) for crop in self.crops]
        if confidences:
            stats["average_confidence"] = np.mean(confidences)
        
        # Map coverage (percentage of map with crops)
        # Rough estimate based on crop distribution
        unique_coords = set()
        for crop in self.crops:
            # Round to nearest grid cell
            coords = crop.get("map_coords")
            if coords:
                x = (coords[0] // 50) * 50
                y = (coords[1] // 50) * 50
                unique_coords.add((x, y))
        
        total_cells = (self.map_width // 50) * (self.map_height // 50)
        if total_cells > 0:
            stats["map_coverage"] = len(unique_coords) / total_cells
        
        return stats
    
    def get_crops_in_region(self,
                           map_x1: int, map_y1: int,
                           map_x2: int, map_y2: int) -> List[Dict]:
        """
        Get crops within a map region.
        
        Args:
            map_x1, map_y1: Top-left corner
            map_x2, map_y2: Bottom-right corner
            
        Returns:
            list: Crops in region
        """
        crops_in_region = []
        for crop in self.crops:
            coords = crop.get("map_coords")
            if coords:
                x, y = coords
                if map_x1 <= x <= map_x2 and map_y1 <= y <= map_y2:
                    crops_in_region.append(crop)
        return crops_in_region
    
    def get_nearest_crops(self,
                         map_coords: Tuple[int, int],
                         count: int = 5) -> List[Dict]:
        """
        Get nearest crops to a location.
        
        Args:
            map_coords (tuple): Map coordinates (x, y)
            count (int): Number of crops to return
            
        Returns:
            list: Nearest crops sorted by distance
        """
        distances = []
        x_target, y_target = map_coords
        
        for crop in self.crops:
            coords = crop.get("map_coords")
            if coords:
                x, y = coords
                distance = np.sqrt((x - x_target)**2 + (y - y_target)**2)
                distances.append((distance, crop))
        
        # Sort by distance
        distances.sort(key=lambda x: x[0])
        
        # Return top N crops
        return [crop for _, crop in distances[:count]]
    
    def clear_old_crops(self, age_seconds: int = 300):
        """
        Remove crops older than specified age.
        
        Args:
            age_seconds (int): Age threshold in seconds
        """
        current_time = datetime.now()
        self.crops = [
            crop for crop in self.crops
            if (current_time - crop["timestamp"]).total_seconds() < age_seconds
        ]
    
    def clear_all(self):
        """Clear all crops from map."""
        self.crops = []
        logger.info("Farm map cleared")
    
    def export_crop_data(self) -> List[Dict]:
        """
        Export crop data for storage or analysis.
        
        Returns:
            list: Serializable crop data
        """
        exported = []
        for crop in self.crops:
            exported.append({
                "id": crop["id"],
                "class": crop["class"],
                "health": crop["health"],
                "confidence": crop["confidence"],
                "map_coords": crop["map_coords"],
                "frame_coords": crop["frame_coords"],
                "timestamp": crop["timestamp"].isoformat()
            })
        return exported
    
    def import_crop_data(self, crop_data: List[Dict]):
        """
        Import crop data from storage.
        
        Args:
            crop_data (list): Crop data to import
        """
        for data in crop_data:
            try:
                crop_record = {
                    "id": data.get("id", len(self.crops)),
                    "class": data.get("class", "unknown"),
                    "health": data.get("health", "unknown"),
                    "confidence": data.get("confidence", 0.0),
                    "map_coords": tuple(data.get("map_coords", (0, 0))),
                    "frame_coords": tuple(data.get("frame_coords", (0, 0))),
                    "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.now().isoformat())),
                    "bbox": None,
                    "detection_data": {}
                }
                self.crops.append(crop_record)
            except Exception as e:
                logger.error(f"Error importing crop data: {e}")

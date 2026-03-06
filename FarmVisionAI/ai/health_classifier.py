"""
FarmVisionAI Health Classification Module
=========================================

Classifies crop health based on:
- Color analysis (HSV)
- Texture detection
- Brightness variation

Designed to be replaceable with CNN later.

"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional
from sklearn.cluster import KMeans
from utils.config import (
    HEALTH_STATES, HSV_RANGES, get_logger
)

logger = get_logger(__name__)

class HealthClassifier:
    """
    Hybrid health classifier using color, texture, and brightness analysis.
    """
    
    def __init__(self):
        """Initialize health classifier."""
        self.hsv_ranges = HSV_RANGES
        logger.info("HealthClassifier initialized")
    
    def classify(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> Dict:
        """
        Classify health of crop in bounding box.
        
        Args:
            frame (np.ndarray): Input frame in BGR
            bbox (tuple): Bounding box (x1, y1, x2, y2)
            
        Returns:
            dict: Classification results with scores
        """
        try:
            # Extract crop region
            x1, y1, x2, y2 = bbox
            crop_region = frame[y1:y2, x1:x2]
            
            if crop_region.size == 0:
                logger.warning("Invalid crop region for classification")
                return {"health": "unknown", "confidence": 0.0, "scores": {}}
            
            # Analyze color
            color_scores = self._analyze_color(crop_region)
            
            # Analyze texture
            texture_scores = self._analyze_texture(crop_region)
            
            # Analyze brightness
            brightness_scores = self._analyze_brightness(crop_region)
            
            # Combine scores
            final_scores = self._combine_scores(
                color_scores,
                texture_scores,
                brightness_scores
            )
            
            # Get final health classification
            health, confidence = self._get_final_health(final_scores)
            
            result = {
                "health": health,
                "confidence": confidence,
                "scores": final_scores,
                "details": {
                    "color": color_scores,
                    "texture": texture_scores,
                    "brightness": brightness_scores
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return {"health": "unknown", "confidence": 0.0, "scores": {}}
    
    def _analyze_color(self, crop_region: np.ndarray) -> Dict[str, float]:
        """
        Analyze color characteristics using HSV.
        
        Args:
            crop_region (np.ndarray): Crop region in BGR
            
        Returns:
            dict: Health scores based on color
        """
        try:
            # Convert to HSV
            hsv = cv2.cvtColor(crop_region, cv2.COLOR_BGR2HSV)
            
            # Calculate mean HSV values
            h_mean = np.mean(hsv[:, :, 0])
            s_mean = np.mean(hsv[:, :, 1])
            v_mean = np.mean(hsv[:, :, 2])
            
            scores = {}
            
            # Score each health state based on HSV ranges
            for health_state, ranges in self.hsv_ranges.items():
                h_range = ranges['h']
                s_range = ranges['s']
                v_range = ranges['v']
                
                # Calculate how well the mean values fit each range
                h_score = 1.0 if h_range[0] <= h_mean <= h_range[1] else 0.0
                s_score = 1.0 if s_range[0] <= s_mean <= s_range[1] else 0.5
                v_score = 1.0 if v_range[0] <= v_mean <= v_range[1] else 0.5
                
                # Combined color score
                scores[health_state] = (h_score + s_score + v_score) / 3.0
            
            return scores
            
        except Exception as e:
            logger.debug(f"Color analysis error: {e}")
            return {state: 0.2 for state in self.hsv_ranges.keys()}
    
    def _analyze_texture(self, crop_region: np.ndarray) -> Dict[str, float]:
        """
        Analyze texture characteristics.
        
        Args:
            crop_region (np.ndarray): Crop region
            
        Returns:
            dict: Health scores based on texture
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(crop_region, cv2.COLOR_BGR2GRAY)
            
            # Calculate Laplacian variance (focus/sharpness)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Calculate local binary patterns (texture)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Healthy crops have good texture definition
            scores = {
                "healthy": min(1.0, laplacian_var / 1000.0 * 0.5 + edge_density),
                "ripe": min(1.0, laplacian_var / 800.0 * 0.4 + edge_density * 0.8),
                "unripe": min(1.0, laplacian_var / 600.0 * 0.3 + edge_density * 0.6),
                "rotten": min(1.0, (1.0 - edge_density) * 0.7),
                "diseased": min(1.0, laplacian_var / 500.0 * 0.6 + edge_density * 0.5)
            }
            
            return scores
            
        except Exception as e:
            logger.debug(f"Texture analysis error: {e}")
            return {state: 0.2 for state in self.hsv_ranges.keys()}
    
    def _analyze_brightness(self, crop_region: np.ndarray) -> Dict[str, float]:
        """
        Analyze brightness characteristics.
        
        Args:
            crop_region (np.ndarray): Crop region
            
        Returns:
            dict: Health scores based on brightness
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(crop_region, cv2.COLOR_BGR2GRAY)
            
            # Calculate brightness metrics
            brightness = np.mean(gray)
            brightness_std = np.std(gray)
            
            # Brightness ranges for different conditions
            scores = {}
            
            # Healthy crops: moderate-high brightness, good smoothness
            if 80 < brightness < 200 and 20 < brightness_std < 80:
                scores["healthy"] = 0.9
                scores["ripe"] = 0.6
                scores["unripe"] = 0.5
                scores["rotten"] = 0.2
                scores["diseased"] = 0.3
            # Dark/rotten crops: low brightness
            elif brightness < 80:
                scores["healthy"] = 0.2
                scores["ripe"] = 0.3
                scores["unripe"] = 0.5
                scores["rotten"] = 0.9
                scores["diseased"] = 0.7
            # Very bright/ripe crops
            elif brightness > 180:
                scores["healthy"] = 0.5
                scores["ripe"] = 0.8
                scores["unripe"] = 0.3
                scores["rotten"] = 0.4
                scores["diseased"] = 0.3
            # Medium brightness
            else:
                scores["healthy"] = 0.6
                scores["ripe"] = 0.7
                scores["unripe"] = 0.7
                scores["rotten"] = 0.4
                scores["diseased"] = 0.5
            
            return scores
            
        except Exception as e:
            logger.debug(f"Brightness analysis error: {e}")
            return {state: 0.2 for state in self.hsv_ranges.keys()}
    
    def _combine_scores(self,
                       color_scores: Dict,
                       texture_scores: Dict,
                       brightness_scores: Dict) -> Dict[str, float]:
        """
        Combine individual analysis scores with weighted averaging.
        
        Args:
            color_scores (dict): Color analysis scores
            texture_scores (dict): Texture analysis scores
            brightness_scores (dict): Brightness analysis scores
            
        Returns:
            dict: Combined scores
        """
        # Weights for each analysis method
        color_weight = 0.5
        texture_weight = 0.25
        brightness_weight = 0.25
        
        combined = {}
        for state in color_scores.keys():
            combined[state] = (
                color_scores.get(state, 0.2) * color_weight +
                texture_scores.get(state, 0.2) * texture_weight +
                brightness_scores.get(state, 0.2) * brightness_weight
            )
        
        return combined
    
    def _get_final_health(self, scores: Dict[str, float]) -> Tuple[str, float]:
        """
        Get final health classification from scores.
        
        Args:
            scores (dict): Health scores
            
        Returns:
            tuple: (health_state, confidence)
        """
        if not scores:
            return "unknown", 0.0
        
        # Find highest score
        best_health = max(scores, key=scores.get)
        confidence = scores[best_health]
        
        return best_health, min(1.0, confidence)
    
    def classify_batch(self,
                      frame: np.ndarray,
                      detections: list) -> list:
        """
        Classify health of multiple detections.
        
        Args:
            frame (np.ndarray): Input frame
            detections (list): List of detections with bbox
            
        Returns:
            list: Detections with health classification
        """
        for detection in detections:
            bbox = detection.get("bbox")
            if bbox:
                health_result = self.classify(frame, bbox)
                detection["health"] = health_result["health"]
                detection["health_confidence"] = health_result["confidence"]
                detection["health_scores"] = health_result["scores"]
        
        return detections

class CNNHealthClassifier:
    """
    Placeholder for CNN-based health classifier.
    To be implemented later for more accurate classification.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize CNN classifier.
        
        Args:
            model_path (str, optional): Path to trained CNN model
        """
        self.model = None
        self.model_path = model_path
        logger.info("CNNHealthClassifier placeholder initialized")
    
    def load_model(self, model_path: str):
        """Load pre-trained CNN model."""
        # TODO: Implement CNN loading
        logger.info(f"CNN model loading not yet implemented: {model_path}")
    
    def classify(self, crop_region: np.ndarray) -> Dict:
        """
        Classify health using CNN.
        
        Args:
            crop_region (np.ndarray): Crop image region
            
        Returns:
            dict: Classification results
        """
        # TODO: Implement CNN inference
        logger.warning("CNN classification not yet implemented, using fallback")
        return {"health": "unknown", "confidence": 0.0}

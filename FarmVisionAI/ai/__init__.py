"""
FarmVisionAI - AI Package
========================

Provides computer vision and machine learning models.

Modules:
- detector: YOLO v8 object detection
- health_classifier: Crop health classification
"""

from .detector import ObjectDetector, DetectionBuffer
from .health_classifier import HealthClassifier, CNNHealthClassifier

__all__ = [
    'ObjectDetector',
    'DetectionBuffer',
    'HealthClassifier',
    'CNNHealthClassifier'
]

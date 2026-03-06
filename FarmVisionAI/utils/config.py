"""
FarmVisionAI Configuration Module
==================================

Central configuration management for the entire FarmVisionAI system.
Contains settings for camera, detection, health classification, and mapping.

"""

import os
import logging
from pathlib import Path

# ==================== PROJECT PATHS ====================
PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
OUTPUT_DIR = PROJECT_ROOT / "output"
LOGS_DIR = OUTPUT_DIR / "logs"

# Create directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# ==================== YOLO SETTINGS ====================
# Model configuration
YOLO_MODEL_NAME = "yolov8x.pt"
YOLO_MODEL_PATH = MODELS_DIR / YOLO_MODEL_NAME
YOLO_MODEL_URL = "https://github.com/ultralytics/assets/releases/download/v8.0.0/yolov8x.pt"
YOLO_DEVICE = "cpu"  # Change to "0" or "1" for GPU
YOLO_CONFIDENCE_THRESHOLD = 0.40
YOLO_IOU_THRESHOLD = 0.45
YOLO_IMAGE_SIZE = 640

# Crop classes to detect
CROP_CLASSES = [
    "tomato",
    "potato",
    "onion",
    "carrot",
    "cabbage",
    "chili",
    "banana",
    "apple",
    "plant",
    "leaf",
    "crop"
]

# ==================== CAMERA SETTINGS ====================
# ADB camera configuration
CAMERA_FPS = 30  # Target frames per second
CAMERA_FRAME_WIDTH = 1280
CAMERA_FRAME_HEIGHT = 720
CAMERA_BUFFER_SIZE = 5  # Number of frames to buffer
ADB_TIMEOUT = 10  # Seconds to wait for ADB response
FRAME_SKIP = 2  # Process every 2nd frame for performance

# ==================== HEALTH CLASSIFICATION ====================
# Health state colors (BGR format for OpenCV)
HEALTH_STATES = {
    "healthy": (0, 255, 0),      # Green
    "ripe": (0, 255, 255),        # Yellow
    "unripe": (255, 0, 0),        # Blue
    "rotten": (0, 0, 255),        # Red
    "diseased": (255, 0, 255)     # Magenta
}

# HSV ranges for color-based classification
HSV_RANGES = {
    "healthy": {"h": (35, 85), "s": (40, 255), "v": (50, 255)},
    "ripe": {"h": (0, 20), "s": (80, 255), "v": (100, 255)},
    "unripe": {"h": (35, 85), "s": (50, 255), "v": (80, 200)},
    "rotten": {"h": (0, 10), "s": (50, 255), "v": (30, 150)},
}

# ==================== FARM MAPPING ====================
# Map configuration
MAP_GRID_SIZE = 100  # Size of each grid cell in pixels
MAP_WIDTH = 1200  # Total map width in pixels
MAP_HEIGHT = 1200  # Total map height in pixels
MAP_BACKGROUND_COLOR = (240, 240, 240)  # Light gray
MAP_GRID_COLOR = (200, 200, 200)  # Medium gray
MAP_CROP_RADIUS = 8  # Radius of crop marker circles

# Coordinate system settings
REAL_WORLD_SCALE = 0.5  # Meters per pixel in real world
MAX_DETECTION_HISTORY = 100  # Max detections to keep in history

# ==================== VISUALIZATION ====================
# Display settings
DISPLAY_CONFIDENCE = True
DISPLAY_HEALTH = True
DISPLAY_CLASS = True
WINDOW_DETECTION = "Phone Camera Detection"
WINDOW_MAP = "Farm Map"
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720

# Text settings
TEXT_FONT = 2  # OpenCV font
TEXT_SCALE = 0.6
TEXT_THICKNESS = 2
TEXT_COLOR = (255, 255, 255)  # White

# Bounding box settings
BOX_THICKNESS = 2
BOX_COLOR = (0, 255, 0)  # Green

# ==================== LOGGING ====================
LOG_FILE = LOGS_DIR / "farm_vision.log"
LOG_LEVEL = logging.INFO

# Configure logging
logging.basicConfig(
    level=LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

# ==================== PERFORMANCE ====================
# Performance optimization
TARGET_FPS = 15  # Target processing FPS
FRAME_TIMEOUT = 5  # Timeout for frame capture in seconds
MAX_RETRY_ATTEMPTS = 3  # Max ADB reconnection attempts
RETRY_DELAY = 1  # Seconds between retry attempts

# Threading
USE_THREADING = True  # Use threading for camera capture
THREAD_TIMEOUT = 10  # Thread timeout in seconds

# ==================== OUTPUT ====================
# Output file paths
DETECTIONS_JSON = OUTPUT_DIR / "detections.json"
FARM_MAP_PNG = OUTPUT_DIR / "farm_map.png"
STATISTICS_JSON = OUTPUT_DIR / "statistics.json"

# Enable/disable output generation
SAVE_DETECTIONS = True
SAVE_FARM_MAP = True
SAVE_STATISTICS = True

# ==================== DEBUG ====================
DEBUG_MODE = True
VERBOSE_LOGGING = False

def get_logger(name):
    """
    Get a logger instance for a module.
    
    Args:
        name (str): Module name
        
    Returns:
        logging.Logger: Configured logger
    """
    return logging.getLogger(name)

def print_config():
    """Print current configuration for debugging."""
    logger = get_logger("CONFIG")
    logger.info("=" * 50)
    logger.info("FarmVisionAI Configuration")
    logger.info("=" * 50)
    logger.info(f"Project Root: {PROJECT_ROOT}")
    logger.info(f"Model Path: {YOLO_MODEL_PATH}")
    logger.info(f"Output Dir: {OUTPUT_DIR}")
    logger.info(f"Confidence Threshold: {YOLO_CONFIDENCE_THRESHOLD}")
    logger.info(f"Target FPS: {TARGET_FPS}")
    logger.info(f"Frame Skip: {FRAME_SKIP}")
    logger.info("=" * 50)

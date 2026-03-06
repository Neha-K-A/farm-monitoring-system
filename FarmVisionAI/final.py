"""
Farm Fruit & Vegetable Detection with Health Classification & Farm Mapping
Web-Enabled with Flask MJPEG Streaming
===========================================================================

Complete farm monitoring system with real-time video streaming.
No OpenCV GUI windows - everything streams via Flask HTTP/MJPEG.

FEATURES:
✓ IP Webcam streaming with MJPEG output
✓ Real-time crop detection & classification  
✓ 8-level health status classification
✓ Real-time farm layout mapping
✓ Flask HTTP server with dual video feeds:
  - /video_feed_main: Live detection feed (MJPEG)
  - /video_feed_map: Farm layout map feed (MJPEG)
  - /metrics: JSON metrics endpoint
✓ Multi-metric damage analysis
✓ HSV-based ripeness detection
✓ Statistical tracking
✓ Robust IP camera reconnection
✓ Background detection thread
✓ Thread-safe metrics sharing
"""

import cv2
import numpy as np
import time
import threading
from ultralytics import YOLO
from collections import defaultdict
import os
import dotenv
from flask import Flask, Response, jsonify
from flask_cors import CORS
import logging
import urllib.request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================

import dotenv
dotenv.load_dotenv()

# IP Webcam URL - configurable via environment variable
# Defaults to webcam (0) if not set or not accessible
IP_URL = os.getenv('CAMERA_SOURCE', 'http://10.251.206.46:8080/video')
VISION_PORT = int(os.getenv('VISION_PORT', 5000))
VISION_HOST = os.getenv('VISION_HOST', '0.0.0.0')

logger.info(f"[CONFIG] CAMERA_SOURCE from env: {IP_URL}")

# Try IP URL if provided, otherwise use webcam
if IP_URL != '0' and not IP_URL.isdigit():
    try:
        import urllib.request
        urllib.request.urlopen(IP_URL, timeout=2)
        logger.info(f"[CONFIG] Using IP camera: {IP_URL}")
    except Exception as e:
        logger.warning(f"[CONFIG] IP camera {IP_URL} not accessible ({str(e)}), falling back to webcam")
        IP_URL = '0'
else:
    logger.info("[CONFIG] Using webcam as default camera source")

FRAME_W, FRAME_H = 640, 480

# Farm map dimensions
MAP_WIDTH, MAP_HEIGHT = 800, 800
MAP_GRID_SIZE = 50

# Model selection
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "yolov8m-seg.pt")
IMG_SZ = 512
CONF = 0.40
IOU = 0.45
DETECT_EVERY = 2

# Target labels
TARGET_LABELS = {
    "apple", "orange", "banana", "tomato", "potato", "carrot", "lettuce", 
    "pepper", "grape", "strawberry", "watermelon", "pumpkin", "cucumber",
    "eggplant", "broccoli", "spinach", "kale", "mango", "pineapple", "lemon"
}

ROI_ANALYZE = 192

# Damage thresholds
BITE_THR = 0.060
BOUNDARY_JAG_THR = 0.20
SPOT_RATIO_THR = 0.018
SPOT_LARGEST_BLOB_THR = 0.010
TEX_THR = 9
DARK_DIFF_THR = 15
MIN_FRUIT_PIXELS = 2000

# Ripeness thresholds
RIPE_S_MIN = 40
RIPE_V_MIN = 100
UNRIPE_S_MAX = 55
OVERRIPE_V_MIN = 145

FONT = cv2.FONT_HERSHEY_SIMPLEX

HEALTH_COLORS = {
    "Ripe": (0, 255, 0),
    "Unripe": (0, 165, 255),
    "Under-ripe": (100, 200, 255),
    "Over-ripe": (0, 100, 255),
    "Rotten": (0, 0, 255),
    "Infected": (255, 0, 255),
    "Severely Damaged": (0, 0, 139),
    "Unknown": (200, 200, 200)
}

# MJPEG encoding
JPEG_QUALITY = 80
RESIZE_SCALE = 0.9  # Resize to 90% for streaming

# ============================================================================
# GLOBAL VARIABLES - Thread Safe
# ============================================================================

# Frame buffers
current_detection_frame = None
current_map_frame = None
frame_lock = threading.Lock()

# Metrics dictionary
metrics = {
    "fps": 0.0,
    "total_frames": 0,
    "objects_detected": 0,
    "current_frame_objects": 0,
    "crops": defaultdict(int),  # Count by label
    "health_states": defaultdict(int),  # Count by health state
    "ripeness": {
        "ripe": 0,
        "unripe": 0,
        "under_ripe": 0,
        "over_ripe": 0
    }
}
metrics_lock = threading.Lock()

# ============================================================================
# FARM MAPPING SYSTEM
# ============================================================================

class FarmMapTracker:
    """Tracks detected crops and visualizes farm layout in top-down view."""
    
    def __init__(self, map_width, map_height, frame_w, frame_h):
        self.map_width = map_width
        self.map_height = map_height
        self.frame_w = frame_w
        self.frame_h = frame_h
        self.scale_x = map_width / frame_w
        self.scale_y = map_height / frame_h
        self.detected_crops = []
        self.map_canvas = None
        self._init_map_canvas()
    
    def _init_map_canvas(self):
        """Initialize farm map with grid."""
        self.map_canvas = np.ones((self.map_height, self.map_width, 3), dtype=np.uint8) * 40
        # Draw grid
        for i in range(0, self.map_width, MAP_GRID_SIZE):
            cv2.line(self.map_canvas, (i, 0), (i, self.map_height), (60, 60, 60), 1)
        for i in range(0, self.map_height, MAP_GRID_SIZE):
            cv2.line(self.map_canvas, (0, i), (self.map_width, i), (60, 60, 60), 1)
    
    def frame_to_map_coords(self, frame_x, frame_y):
        """Convert frame coordinates to map coordinates."""
        map_x = int(frame_x * self.scale_x)
        map_y = int(frame_y * self.scale_y)
        map_x = max(0, min(self.map_width - 1, map_x))
        map_y = max(0, min(self.map_height - 1, map_y))
        return map_x, map_y
    
    def add_detection(self, frame_x, frame_y, label, health_state):
        """Add detected crop to map."""
        map_x, map_y = self.frame_to_map_coords(frame_x, frame_y)
        self.detected_crops.append({
            "x": map_x,
            "y": map_y,
            "label": label,
            "health": health_state
        })
    
    def update_map(self):
        """Redraw map with all crop markers."""
        if self.map_canvas is None:
            self._init_map_canvas()
        
        for crop in self.detected_crops:
            color = HEALTH_COLORS.get(crop["health"], HEALTH_COLORS["Unknown"])
            cv2.circle(self.map_canvas, (crop["x"], crop["y"]), 6, color, -1)
            cv2.circle(self.map_canvas, (crop["x"], crop["y"]), 6, (255, 255, 255), 1)
    
    def draw_map_info(self):
        """Add info overlay to map."""
        cv2.putText(self.map_canvas, "FARM MAP - Top Down View", (10, 30), 
                   FONT, 0.9, (255, 255, 255), 2)
        cv2.putText(self.map_canvas, f"Crops Detected: {len(self.detected_crops)}", 
                   (10, 60), FONT, 0.7, (200, 200, 200), 1)
        
        # Draw legend
        legend_y = 100
        cv2.putText(self.map_canvas, "Legend:", (10, legend_y), FONT, 0.6, 
                   (200, 200, 200), 1)
        for state, color in list(HEALTH_COLORS.items())[:4]:
            legend_y += 25
            cv2.circle(self.map_canvas, (25, legend_y - 5), 4, color, -1)
            cv2.putText(self.map_canvas, state, (50, legend_y), FONT, 0.5, 
                       (200, 200, 200), 1)
    
    def get_map(self):
        """Return current map."""
        return self.map_canvas.copy() if self.map_canvas is not None else None
    
    def clear(self):
        """Clear detected crops."""
        self.detected_crops = []
    
    def save_map(self, filename):
        """Save map to file."""
        if self.map_canvas is not None:
            cv2.imwrite(filename, self.map_canvas)

# ============================================================================
# ENHANCED FRAME GRABBER WITH AUTO-RECONNECT
# ============================================================================

class FrameGrabber(threading.Thread):
    """Robust IP camera streaming with auto-reconnection."""
    
    def __init__(self, url, width, height):
        super().__init__(daemon=True)
        self.url = url
        self.width = width
        self.height = height
        self.frame = None
        self.frame_lock = threading.Lock()
        self.stop_event = threading.Event()
        self.cap = None
        self.reconnect_attempts = 0
        self.use_synthetic = False
        self.frame_count = 0
    
    def generate_synthetic_frame(self):
        """Generate a synthetic test frame with gradients and patterns."""
        self.frame_count += 1
        
        # Create a colorful test pattern
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        
        # Add gradient background
        for i in range(self.height):
            frame[i, :] = [
                int(255 * i / self.height),  # Red gradient
                int(128),  # Green constant
                int(255 * (1 - i / self.height))  # Blue gradient
            ]
        
        # Add moving circles (simulating objects)
        circle_offset = (self.frame_count * 5) % self.width
        cv2.circle(frame, (circle_offset, 200), 50, (0, 255, 255), -1)
        cv2.circle(frame, ((circle_offset + 200) % self.width, 400), 40, (0, 255, 0), -1)
        
        # Add text
        cv2.putText(frame, "TEST PATTERN (Camera Not Available)", (50, 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, f"Frame: {self.frame_count}", (50, self.height - 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return frame
    
    def run(self):
        """Background thread for frame capture."""
        max_fail_attempts = 10
        
        while not self.stop_event.is_set():
            try:
                if self.cap is None and not self.use_synthetic:
                    logger.info(f"[CAMERA] Connecting to {self.url}...")
                    self.cap = cv2.VideoCapture(int(self.url) if self.url.isdigit() else self.url)
                    
                    # Set connection timeout (3 seconds max) - version safe
                    if not self.url.isdigit() and hasattr(cv2, "CAP_PROP_OPEN_TIMEOUT_MSECS"):
                        self.cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSECS, 3000)
                    
                    self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    self.reconnect_attempts = 0
                
                if self.use_synthetic:
                    # Generate synthetic frame
                    with self.frame_lock:
                        self.frame = self.generate_synthetic_frame()
                    time.sleep(0.033)  # ~30 FPS
                else:
                    ret, frame = self.cap.read()
                    if ret:
                        with self.frame_lock:
                            self.frame = frame
                        self.reconnect_attempts = 0
                    else:
                        self.reconnect_attempts += 1
                        logger.warning(f"[CAMERA] Failed to read frame (attempt {self.reconnect_attempts}/{max_fail_attempts})")
                        
                        if self.reconnect_attempts >= max_fail_attempts:
                            logger.warning("[CAMERA] Max reconnection attempts reached, using synthetic frames")
                            self.use_synthetic = True
                            if self.cap:
                                self.cap.release()
                            self.cap = None
                        else:
                            if self.cap:
                                self.cap.release()
                            self.cap = None
                            time.sleep(1)
                        
            except Exception as e:
                logger.error(f"[CAMERA] Error: {e}")
                self.reconnect_attempts += 1
                
                if self.reconnect_attempts >= max_fail_attempts:
                    logger.warning("[CAMERA] Switching to synthetic frames due to repeated failures")
                    self.use_synthetic = True
                
                if self.cap:
                    self.cap.release()
                self.cap = None
                time.sleep(1)
    
    def read(self):
        """Get current frame."""
        with self.frame_lock:
            if self.frame is not None:
                return self.frame.copy()
            else:
                # Return a placeholder frame if camera not ready yet
                placeholder = np.zeros((self.height, self.width, 3), dtype=np.uint8)
                cv2.putText(placeholder, "Initializing camera...", (100, self.height//2),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
                return placeholder
    
    def stop(self):
        """Stop frame grabber."""
        self.stop_event.set()
        if self.cap:
            self.cap.release()

# ============================================================================
# DETECTION & CLASSIFICATION FUNCTIONS (FROM ORIGINAL PIPELINE)
# ============================================================================

def resize_square(img, size):
    """Resize image to square, maintaining aspect ratio."""
    h, w = img.shape[:2]
    s_max = max(h, w)
    canvas = np.zeros((s_max, s_max, *img.shape[2:]), dtype=img.dtype)
    off_h = (s_max - h) // 2
    off_w = (s_max - w) // 2
    canvas[off_h:off_h+h, off_w:off_w+w] = img
    return cv2.resize(canvas, (size, size), interpolation=cv2.INTER_LINEAR)

def bite_score_solidity(mask):
    """Calculate bite/damage score based on solidity."""
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not contours:
        return 1.0, 0, None
    c = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(c)
    hull_area = cv2.contourArea(cv2.convexHull(c))
    solidity = area / hull_area if hull_area > 0 else 1.0
    bite_score = max(0, 1.0 - solidity)
    return bite_score, area, c

def boundary_jaggedness(mask, contour):
    """Measure boundary roughness."""
    if contour is None:
        return 0.0
    contour = contour.reshape(-1, 2).astype(float)
    if len(contour) < 2:
        return 0.0
    diffs = np.diff(contour, axis=0)
    angles = np.arctan2(diffs[:, 1], diffs[:, 0])
    angle_diffs = np.abs(np.diff(angles))
    angle_diffs = np.minimum(angle_diffs, 2*np.pi - angle_diffs)
    smoothness = 1.0 / (1.0 + np.mean(angle_diffs)) if len(angle_diffs) > 0 else 1.0
    return max(0, 1.0 - smoothness)

def spot_metrics(roi, mask):
    """Analyze spots and defects."""
    h, w = roi.shape[:2]
    if h < 10 or w < 10:
        return 0.0, 0.0, 1.0
    
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    roi_gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    # Dark spots
    dark_mask = roi_gray < 50
    dark_pixels = np.sum(dark_mask & (mask > 0))
    
    # Blobs
    blobs = cv2.connectedComponentsWithStats(dark_mask.astype(np.uint8), connectivity=8)
    num_blobs = blobs[0]
    blob_stats = blobs[2]
    
    largest_blob_area = 0
    if num_blobs > 1:
        largest_blob_area = max(blob_stats[1:, cv2.CC_STAT_AREA])
    
    fruit_pixels = np.sum(mask > 0)
    spot_ratio = dark_pixels / fruit_pixels if fruit_pixels > 100 else 0.0
    largest_blob_ratio = largest_blob_area / fruit_pixels if fruit_pixels > 100 else 0.0
    
    is_damaged = (spot_ratio > SPOT_RATIO_THR) or (largest_blob_ratio > SPOT_LARGEST_BLOB_THR)
    strength = 0.5 if is_damaged else 1.0
    
    return spot_ratio, largest_blob_ratio, strength

def analyze_ripeness_by_color(roi, mask, label):
    """Analyze ripeness using HSV color."""
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    roi_masked = np.where(mask[..., None] > 0, hsv, 0)
    
    h = roi_masked[..., 0]
    s = roi_masked[..., 1]
    v = roi_masked[..., 2]
    
    valid = mask > 0
    if not np.any(valid):
        return 0.5, "Unknown"
    
    s_avg = np.mean(s[valid])
    v_avg = np.mean(v[valid])
    
    if s_avg >= RIPE_S_MIN and v_avg >= RIPE_V_MIN and v_avg < OVERRIPE_V_MIN:
        return 0.8, "Ripe"
    elif s_avg < UNRIPE_S_MAX or v_avg < RIPE_V_MIN:
        return 0.3, "Unripe"
    elif v_avg >= OVERRIPE_V_MIN:
        return 0.9, "Over-ripe"
    else:
        return 0.5, "Under-ripe"

def classify_health_state(label, bite, jag, spot_ratio, blob_ratio, strength, ripeness_state):
    """Classify overall health state."""
    if ripeness_state == "Over-ripe":
        return "Over-ripe"
    if ripeness_state == "Rotten":
        return "Rotten"
    
    damage_score = bite + jag + spot_ratio
    
    if blob_ratio > SPOT_LARGEST_BLOB_THR:
        return "Infected"
    if bite > BITE_THR*2 or damage_score > 0.3:
        return "Severely Damaged"
    if bite > BITE_THR or damage_score > 0.15:
        return "Rotten"
    if ripeness_state == "Unripe":
        return "Unripe"
    if ripeness_state == "Under-ripe":
        return "Under-ripe"
    
    return ripeness_state

def get_health_stats_string(bite, jag, spot_ratio, blob_ratio):
    """Format health metrics for display."""
    return f"Bite:{bite:.2f} Jag:{jag:.2f} Spots:{spot_ratio:.3f}"

def get_mask_for_box(results, i, frame_shape):
    """Extract segmentation mask for detection."""
    try:
        r = results
        x1, y1, x2, y2 = r.boxes.xyxy[i].cpu().numpy().astype(int)
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame_shape[1], x2), min(frame_shape[0], y2)
        
        if x2 <= x1 or y2 <= y1:
            return None, None
        
        if r.masks is not None:
            mask = r.masks.data[i].cpu().numpy()
            m = cv2.resize(mask, (frame_shape[1], frame_shape[0]))
            mask01 = (m > 0.5).astype(np.uint8)
        else:
            mask01 = None
        
        return (x1, y1, x2, y2), mask01
    except:
        return None, None

# ============================================================================
# DETECTION LOOP (RUNS IN BACKGROUND THREAD)
# ============================================================================

def run_detection_pipeline():
    """Background thread for vision processing."""
    global current_detection_frame, current_map_frame, metrics
    
    logger.info("[PIPELINE] Loading YOLO model...")
    
    # Handle corrupted model file
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Check if model file exists and is valid
            if os.path.exists(MODEL_PATH):
                file_size = os.path.getsize(MODEL_PATH)
                if file_size < 1000000:  # Less than 1MB is suspiciously small
                    logger.warning(f"[PIPELINE] Model file suspiciously small ({file_size} bytes), removing...")
                    os.remove(MODEL_PATH)
            
            model = YOLO(MODEL_PATH)
            try:
                model.fuse()
            except:
                pass
            break
        except (RuntimeError, EOFError, Exception) as e:
            if "PytorchStreamReader" in str(e) or "zip archive" in str(e):
                logger.warning(f"[PIPELINE] Corrupted model detected (attempt {attempt+1}/{max_retries}). Removing and retrying...")
                if os.path.exists(MODEL_PATH):
                    os.remove(MODEL_PATH)
                if attempt == max_retries - 1:
                    logger.error(f"[PIPELINE] Failed to load model after {max_retries} attempts. {str(e)}")
                    raise
                time.sleep(2)
            else:
                raise
    
    logger.info("[PIPELINE] Starting frame grabber...")
    grabber = FrameGrabber(IP_URL, FRAME_W, FRAME_H)
    grabber.start()
    
    farm_map_tracker = FarmMapTracker(MAP_WIDTH, MAP_HEIGHT, FRAME_W, FRAME_H)
    
    frame_id = 0
    fps_ema = 0.0
    alpha = 0.15
    t_prev = time.time()
    
    detection_stats = defaultdict(lambda: {"total": 0, "states": defaultdict(int)})
    frame_object_count = defaultdict(int)
    current_frame_objects_local = {}
    last = []
    
    logger.info("[PIPELINE] Detection loop started")
    
    try:
        while True:
            frame = grabber.read()
            if frame is None:
                time.sleep(0.01)
                continue
            
            frame = cv2.resize(frame, (FRAME_W, FRAME_H), interpolation=cv2.INTER_AREA)
            
            # Clear map on new detection cycle
            if frame_id % DETECT_EVERY == 0:
                farm_map_tracker.clear()
                frame_object_count = defaultdict(int)
                current_frame_objects_local = {}
            
            # Run detection
            if frame_id % DETECT_EVERY == 0:
                results = model.predict(frame, imgsz=IMG_SZ, conf=CONF, iou=IOU, 
                                      verbose=False, device="cpu", max_det=10)
                r = results[0]
                last = []
                detected_labels = []
                
                if r.boxes is not None and len(r.boxes) > 0:
                    for i in range(len(r.boxes)):
                        cls_id = int(r.boxes.cls[i].item())
                        label = model.names.get(cls_id, str(cls_id))
                        
                        if label not in TARGET_LABELS:
                            continue
                        
                        bbox, mask01 = get_mask_for_box(r, i, frame.shape)
                        if bbox is None:
                            continue
                        
                        frame_object_count[label] += 1
                        detected_labels.append(label)
                        last.append((label, bbox, mask01))
                
                if len(last) > 0:
                    total_detected = sum(frame_object_count.values())
                    logger.info(f"[DETECT] Frame {frame_id}: {total_detected} objects")
            
            # Process detections
            object_id_counter = defaultdict(int)
            
            for (label, (x1, y1, x2, y2), mask01_full) in last:
                object_id_counter[label] += 1
                obj_id = object_id_counter[label]
                
                roi = frame[y1:y2, x1:x2]
                if roi.size == 0:
                    continue
                
                if mask01_full is None:
                    mask_roi = np.ones((y2-y1, x2-x1), np.uint8)
                else:
                    mask_roi = mask01_full[y1:y2, x1:x2]
                    if mask_roi.size == 0:
                        continue
                
                # Clean mask
                mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
                mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8), iterations=1)
                
                roi_s = resize_square(roi, ROI_ANALYZE)
                mask_s = resize_square(mask_roi*255, ROI_ANALYZE)
                mask_s = (mask_s > 128).astype(np.uint8)
                
                mask_roi = cv2.medianBlur((mask_roi*255).astype(np.uint8), 5)
                mask_roi = (mask_roi > 128).astype(np.uint8)
                mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((9,9),np.uint8), iterations=1)
                
                # Analyze metrics
                bite, area, contour = bite_score_solidity(mask_s)
                jag = boundary_jaggedness(mask_s, contour)
                spot_ratio, blob_ratio, strength = spot_metrics(roi_s, mask_s)
                
                ripeness_score, ripeness_state = analyze_ripeness_by_color(roi_s, mask_s, label)
                health_state = classify_health_state(label, bite, jag, spot_ratio, blob_ratio, strength, ripeness_state)
                
                color = HEALTH_COLORS.get(health_state, HEALTH_COLORS["Unknown"])
                
                # Draw on detection frame
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                label_text = f"[#{obj_id}] {label.upper()} - {health_state}"
                cv2.putText(frame, label_text, (x1, max(25, y1-10)), FONT, 0.75, color, 2)
                
                stats_str = get_health_stats_string(bite, jag, spot_ratio, blob_ratio)
                cv2.putText(frame, stats_str, (x1, min(FRAME_H-10, y2+22)), FONT, 0.5, (255,255,0), 1)
                
                # Add to farm map
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                farm_map_tracker.add_detection(center_x, center_y, label, health_state)
                
                # Update statistics
                detection_stats[label]["total"] += 1
                detection_stats[label]["states"][health_state] += 1
                
                # Track ripeness
                ripeness_key = ripeness_state.lower().replace("-", "_")
                if ripeness_key in metrics["ripeness"]:
                    metrics["ripeness"][ripeness_key] += 1
            
            # Update farm map
            farm_map_tracker.update_map()
            farm_map_tracker.draw_map_info()
            
            # Calculate FPS
            t_now = time.time()
            inst_fps = 1.0 / max(1e-6, (t_now - t_prev))
            t_prev = t_now
            fps_ema = (1 - alpha) * fps_ema + alpha * inst_fps
            
            # Update detection frame with FPS
            det_count = sum(stat["total"] for stat in detection_stats.values())
            current_frame_count = len(last)
            cv2.putText(frame, f"FPS: {fps_ema:.1f} | Total: {det_count} | Frame: {current_frame_count} object(s)", 
                       (10, 30), FONT, 0.9, (255,0,0), 2)
            
            if len(last) > 0:
                breakdown = " + ".join([f"{label}({frame_object_count[label]})" for label in sorted(set([l for l,_,_ in last]))])
                cv2.putText(frame, f"Objects: {breakdown}", (10, 55), FONT, 0.7, (0, 255, 0), 1)
            
            # Update global metrics (thread-safe)
            with metrics_lock:
                metrics["fps"] = fps_ema
                metrics["total_frames"] = frame_id
                metrics["objects_detected"] = det_count
                metrics["current_frame_objects"] = current_frame_count
                metrics["crops"] = dict(frame_object_count)
                # Update health state counts
                for label, stats in detection_stats.items():
                    for state, count in stats["states"].items():
                        metrics["health_states"][f"{label}_{state}"] = count
            
            # Update frame buffers (thread-safe)
            with frame_lock:
                current_detection_frame = frame.copy()
                map_frame = farm_map_tracker.get_map()
                if map_frame is not None:
                    current_map_frame = map_frame.copy()
            
            frame_id += 1
            
    except KeyboardInterrupt:
        logger.info("[PIPELINE] Shut down requested")
    except Exception as e:
        logger.error(f"[PIPELINE] Error: {e}")
    finally:
        grabber.stop()
        farm_map_tracker.save_map("farm_map_final.png")
        logger.info("[PIPELINE] Shutdown complete")

# ============================================================================
# FLASK SERVER & MJPEG STREAMING
# ============================================================================

app = Flask(__name__)

# Enable CORS for all routes with explicit configuration for multiple origins
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",      # Express backend
            "http://localhost:5173",      # Vite dev server
            "http://localhost:5000",      # Flask itself
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5000"
        ],
        "methods": ["GET", "POST", "OPTIONS", "HEAD"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Content-Length"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

def generate_mjpeg_frames(frame_source):
    """Generate MJPEG stream from frame source."""
    while True:
        with frame_lock:
            if frame_source == 'detection':
                frame = current_detection_frame
            elif frame_source == 'map':
                frame = current_map_frame
            else:
                frame = None
        
        if frame is not None:
            # Resize for streaming
            h, w = frame.shape[:2]
            new_w = int(w * RESIZE_SCALE)
            new_h = int(h * RESIZE_SCALE)
            
            try:
                frame_resized = cv2.resize(frame, (new_w, new_h))
                
                # Encode to JPEG
                ret, buffer = cv2.imencode('.jpg', frame_resized, 
                                          [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                          b'Content-Type: image/jpeg\r\n'
                          b'Content-length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                          + frame_bytes + b'\r\n')
            except Exception as e:
                logger.error(f"[STREAM] Frame encoding error: {e}")
                pass
        
        time.sleep(0.03)  # ~30 FPS

@app.route('/video_feed_main')
def video_feed_main():
    """Live detection feed (MJPEG)."""
    return Response(generate_mjpeg_frames('detection'),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_map')
def video_feed_map():
    """Farm map feed (MJPEG)."""
    return Response(generate_mjpeg_frames('map'),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/metrics')
def get_metrics():
    """Get current metrics as JSON."""
    with metrics_lock:
        return jsonify({
            "fps": round(metrics["fps"], 1),
            "total_frames": metrics["total_frames"],
            "objects_detected": metrics["objects_detected"],
            "current_frame_objects": metrics["current_frame_objects"],
            "crops": dict(metrics["crops"]),
            "ripeness": metrics["ripeness"],
            "health_states": dict(metrics["health_states"])
        })

@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "running",
        "timestamp": time.time()
    })

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Start detection pipeline in background thread
    detection_thread = threading.Thread(target=run_detection_pipeline, daemon=True)
    detection_thread.start()
    
    # Give pipeline time to initialize
    logger.info("[MAIN] Waiting for pipeline initialization...")
    time.sleep(3)
    
    # Start Flask server
    logger.info(f"[MAIN] Starting Flask server on {VISION_HOST}:{VISION_PORT}")
    logger.info("[MAIN] Endpoints:")
    logger.info(f"[MAIN]   - http://localhost:{VISION_PORT}/video_feed_main (Detection feed)")
    logger.info(f"[MAIN]   - http://localhost:{VISION_PORT}/video_feed_map (Farm map feed)")
    logger.info(f"[MAIN]   - http://localhost:{VISION_PORT}/metrics (JSON metrics)")
    logger.info(f"[MAIN]   - http://localhost:{VISION_PORT}/health (Health check)")
    logger.info(f"[MAIN]   - http://<server_ip>:{VISION_PORT}/* (Remote endpoints)")
    
    try:
        app.run(host=VISION_HOST, port=VISION_PORT, threaded=True, debug=False)
    except KeyboardInterrupt:
        logger.info("[MAIN] Server shutdown requested")
    except Exception as e:
        logger.error(f"[MAIN] Server error: {e}")

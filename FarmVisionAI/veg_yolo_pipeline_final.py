"""
Farm Fruit & Vegetable Detection with Health Classification & Real-time Farm Mapping
====================================================================================

COMPLETE FARM MONITORING SYSTEM - ALL-IN-ONE FILE

Enhanced system using YOLOv8-Medium Segmentation for accurate fruit/vegetable 
distinction with real-time health classification and farm mapping.

FEATURES:
✓ IP Webcam streaming
✓ Real-time crop detection & classification  
✓ 8-level health status (Ripe, Unripe, Under-ripe, Over-ripe, Rotten, Infected, Damaged, Unknown)
✓ Real-time farm layout mapping
✓ Dual window display:
  - Live detection with bounding boxes
  - Farm map with crop locations
✓ Multi-metric damage analysis (bite, jaggedness, spots, blobs)
✓ HSV-based ripeness detection
✓ Statistical tracking
✓ Frame saving capability
✓ Robust IP camera reconnection
✓ Keyboard controls (q=quit, s=save, p=stats)

SINGLE FILE DESIGN:
All code, detection pipeline, mapping, visualization, error handling in ONE file.
No dependencies on external Python modules beyond requirements.txt
"""

import cv2
import numpy as np
import time
import threading
from ultralytics import YOLO
from collections import defaultdict
import os

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

IP_URL = "http://192.0.0.4:8080/video"  # IP Webcam URL
FRAME_W, FRAME_H = 640, 480

# Farm map dimensions (top-down visualization)
MAP_WIDTH, MAP_HEIGHT = 800, 800  # Square map canvas
MAP_GRID_SIZE = 50  # Grid cell size for reference

# Model selection: yolov8m-seg for better accuracy
MODEL_PATH = "yolov8m-seg.pt"   # Medium model for accurate fruit/veg classification
IMG_SZ = 512                     # Higher resolution for detail
CONF = 0.40                      # Confidence threshold
IOU = 0.45                       # IoU threshold
DETECT_EVERY = 2                # Process every 2nd frame for performance

# Target fruits and vegetables only
TARGET_LABELS = {
    "apple", "orange", "banana", "tomato", "potato", "carrot", "lettuce", 
    "pepper", "grape", "strawberry", "watermelon", "pumpkin", "cucumber",
    "eggplant", "broccoli", "spinach", "kale", "mango", "pineapple", "lemon"
}

ROI_ANALYZE = 192  # Mask/feature analysis size

# Damage detection thresholds (tuned for yolov8m-seg)
BITE_THR = 0.060
BOUNDARY_JAG_THR = 0.20
SPOT_RATIO_THR = 0.018
SPOT_LARGEST_BLOB_THR = 0.010
TEX_THR = 9
DARK_DIFF_THR = 15
MIN_FRUIT_PIXELS = 2000

# Ripeness detection thresholds (HSV-based)
RIPE_S_MIN = 40
RIPE_V_MIN = 100
UNRIPE_S_MAX = 55
OVERRIPE_V_MIN = 145

FONT = cv2.FONT_HERSHEY_SIMPLEX

# Health state colors (BGR format for OpenCV) - used for both detection window and farm map
HEALTH_COLORS = {
    "Ripe": (0, 255, 0),              # Green
    "Unripe": (0, 165, 255),          # Orange
    "Under-ripe": (100, 200, 255),    # Light orange
    "Over-ripe": (0, 100, 255),       # Dark red-orange
    "Rotten": (0, 0, 255),            # Red
    "Infected": (255, 0, 255),        # Magenta
    "Severely Damaged": (0, 0, 139),  # Dark red
    "Unknown": (200, 200, 200)        # Gray
}

# Frame counter for optimization
frame_skip_counter = 0

# ============================================================================
# FARM MAPPING SYSTEM
# ============================================================================

class FarmMapTracker:
    """
    Real-time farm layout tracker.
    Converts detected crops from frame coordinates to farm map coordinates.
    Maintains crop locations and health states for visualization.
    """
    
    def __init__(self, map_width, map_height, frame_width, frame_height):
        self.map_width = map_width
        self.map_height = map_height
        self.frame_width = frame_width
        self.frame_height = frame_height
        
        # Crop locations: list of (map_x, map_y, label, health_state, confidence)
        self.detected_crops = []
        
        # Create blank farm map canvas
        self.farm_map = np.zeros((map_height, map_width, 3), dtype=np.uint8)
        self.farm_map[:] = (40, 40, 40)  # Dark gray background
        
        # Draw grid on farm map for reference
        self._draw_grid()
    
    def _draw_grid(self):
        """Draw reference grid on farm map."""
        for x in range(0, self.map_width, MAP_GRID_SIZE):
            cv2.line(self.farm_map, (x, 0), (x, self.map_height), (60, 60, 60), 1)
        for y in range(0, self.map_height, MAP_GRID_SIZE):
            cv2.line(self.farm_map, (0, y), (self.map_width, y), (60, 60, 60), 1)
    
    def frame_to_map_coords(self, frame_x, frame_y):
        """
        Convert frame coordinates to farm map coordinates.
        
        Args:
            frame_x: X coordinate in frame (0 to frame_width)
            frame_y: Y coordinate in frame (0 to frame_height)
        
        Returns:
            (map_x, map_y): Coordinates in map space (0 to map_width/height)
        """
        map_x = int((frame_x / self.frame_width) * self.map_width)
        map_y = int((frame_y / self.frame_height) * self.map_height)
        
        # Clamp to map bounds
        map_x = max(0, min(self.map_width - 1, map_x))
        map_y = max(0, min(self.map_height - 1, map_y))
        
        return map_x, map_y
    
    def add_detection(self, frame_x, frame_y, label, health_state):
        """
        Add a detected crop to the map.
        
        Args:
            frame_x: Bounding box center X in frame
            frame_y: Bounding box center Y in frame
            label: Crop label (tomato, apple, etc.)
            health_state: Health classification (Ripe, Unripe, etc.)
        """
        map_x, map_y = self.frame_to_map_coords(frame_x, frame_y)
        self.detected_crops.append({
            'x': map_x,
            'y': map_y,
            'label': label,
            'health': health_state
        })
    
    def update_map(self):
        """Redraw the farm map with all detected crops."""
        # Reset map (keep grid)   
        self.farm_map[:] = (40, 40, 40)
        self._draw_grid()
        
        # Draw all detected crops
        for crop in self.detected_crops:
            map_x = crop['x']
            map_y = crop['y']
            health = crop['health']
            color = HEALTH_COLORS.get(health, HEALTH_COLORS['Unknown'])
            
            # Draw crop marker (filled circle)
            cv2.circle(self.farm_map, (map_x, map_y), 6, color, -1)
            # Draw border
            cv2.circle(self.farm_map, (map_x, map_y), 6, (255, 255, 255), 1)
    
    def draw_map_info(self):
        """Draw information overlay on the farm map."""
        # Title
        cv2.putText(self.farm_map, "FARM MAP - TOP DOWN VIEW", 
                   (10, 30), FONT, 1.0, (255, 255, 255), 2)
        
        # Statistics
        total_crops = len(self.detected_crops)
        cv2.putText(self.farm_map, f"Total Crops: {total_crops}", 
                   (10, 65), FONT, 0.7, (200, 200, 200), 1)
        
        # Health legend
        y_pos = 95
        for state, color in list(HEALTH_COLORS.items())[:4]:
            cv2.circle(self.farm_map, (25, y_pos), 4, color, -1)
            cv2.putText(self.farm_map, state, (40, y_pos + 5), FONT, 0.5, color, 1)
            y_pos += 25
        
        # Map dimensions
        cv2.putText(self.farm_map, f"Map: {self.map_width}x{self.map_height}", 
                   (10, self.map_height - 20), FONT, 0.6, (150, 150, 150), 1)
    
    def get_map(self):
        """Return the current farm map image."""
        return self.farm_map.copy()
    
    def clear(self):
        """Clear all detections."""
        self.detected_crops = []
    
    def save_map(self, filename='farm_map.png'):
        """Save the current farm map to a file."""
        success = cv2.imwrite(filename, self.farm_map)
        return success

# ============================================================================
# IP CAMERA STREAMING CLASS
# ============================================================================

class FrameGrabber:
    """
    Non-blocking IP camera frame capture with automatic reconnection.
    Continuously grabs frames from IP Webcam in a background thread.
    """
    
    def __init__(self, src, width=640, height=480):
        self.src = src
        self.width = width
        self.height = height
        self.cap = None
        self.lock = threading.Lock()
        self.frame = None
        self.stopped = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self._connect()
    
    def _connect(self):
        """Establish connection to IP camera."""
        try:
            self.cap = cv2.VideoCapture(self.src)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            return True
        except Exception as e:
            print(f"[ERROR] Failed to connect to camera: {e}")
            return False

    def start(self):
        t = threading.Thread(target=self.update, daemon=True)
        t.start()
        return self

    def update(self):
        """Continuously pull frames from IP camera."""
        while not self.stopped:
            try:
                if self.cap is None or not self.cap.isOpened():
                    if self.reconnect_attempts < self.max_reconnect_attempts:
                        print(f"[WARNING] Camera disconnected. Attempting reconnect ({self.reconnect_attempts + 1}/{self.max_reconnect_attempts})")
                        self.reconnect_attempts += 1
                        time.sleep(3)  # Wait before reconnecting
                        self._connect()
                        continue
                    else:
                        print("[ERROR] Max reconnection attempts reached")
                        break
                
                if self.cap.grab():
                    ret, frm = self.cap.retrieve()
                    if ret:
                        with self.lock:
                            self.frame = frm
                        self.reconnect_attempts = 0  # Reset on successful frame
                else:
                    time.sleep(0.01)
            except Exception as e:
                print(f"[ERROR] Frame capture error: {e}")
                time.sleep(1)

    def read(self):
        """Get latest frame from camera."""
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        """Stop camera streaming and release resources."""
        self.stopped = True
        time.sleep(0.1)
        if self.cap is not None:
            self.cap.release()

# ============================================================================
# DETECTION & CLASSIFICATION FUNCTIONS
# ============================================================================

def resize_square(img, size):
    return cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

def bite_score_solidity(mask01):
    mask = (mask01 * 255).astype(np.uint8)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return 0.0, 0.0, None
    c = max(cnts, key=cv2.contourArea)
    area = float(cv2.contourArea(c))
    if area < 600:
        return 0.0, area, c
    hull = cv2.convexHull(c)
    hull_area = float(cv2.contourArea(hull)) + 1e-6
    solidity = area / hull_area
    return max(0.0, 1.0 - solidity), area, c

def boundary_jaggedness(mask01, contour):
    if contour is None:
        return 0.0
    peri = float(cv2.arcLength(contour, True)) + 1e-6
    area = float(cv2.contourArea(contour)) + 1e-6
    # Circle-like shapes minimize peri^2/area; jagged edges increase it
    score = (peri * peri) / (4.0 * np.pi * area) - 1.0
    return float(max(0.0, score))

def spot_metrics(roi_bgr, mask01):
    """Calculate spot/defect metrics on fruit region."""
    mask = mask01.astype(np.uint8)
    fruit_pixels = int(mask.sum())
    if fruit_pixels < MIN_FRUIT_PIXELS:
        return 0.0, 0.0, 0.0

    gray = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)

    # Remove specular highlights
    highlight = (gray > 245).astype(np.uint8)

    # Illumination-robust local darkness
    local = cv2.GaussianBlur(gray, (0, 0), 5)
    dark_diff = (local.astype(np.int16) - gray.astype(np.int16))
    dark = (dark_diff > DARK_DIFF_THR).astype(np.uint8)

    # Texture
    lap = cv2.Laplacian(gray, cv2.CV_16S, ksize=3)
    tex = (np.abs(lap) > TEX_THR).astype(np.uint8)

    defect = (dark & (tex | (dark_diff > (DARK_DIFF_THR + 10))).astype(np.uint8))
    defect = defect & mask
    defect = defect & (1 - highlight)

    defect = cv2.morphologyEx(defect, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
    defect = cv2.morphologyEx(defect, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8), iterations=1)

    defect_pixels = int(defect.sum())
    spot_ratio = defect_pixels / float(fruit_pixels)

    num, _, stats, _ = cv2.connectedComponentsWithStats(defect, connectivity=8)
    largest = 0
    for i in range(1, num):
        largest = max(largest, int(stats[i, cv2.CC_STAT_AREA]))
    blob_ratio = largest / float(fruit_pixels)

    strength = float(np.mean(dark_diff[defect > 0])) if defect_pixels > 0 else 0.0
    return spot_ratio, blob_ratio, strength

def analyze_ripeness_by_color(roi_bgr, mask01, label):
    """
    Analyze ripeness using HSV color analysis.
    Returns: ripeness_score (0-1), estimated_ripeness_state
    """
    if roi_bgr.size == 0:
        return 0.5, "Unknown"
    
    hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)
    mask_roi = (mask01 > 0).astype(np.uint8) if len(mask01.shape) == 2 else mask01
    
    # Get fruit region only
    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]
    
    fruit_pixels = mask_roi.sum()
    if fruit_pixels < 100:
        return 0.5, "Unknown"
    
    # Average color of fruit
    avg_h = np.mean(h[mask_roi > 0])
    avg_s = np.mean(s[mask_roi > 0])
    avg_v = np.mean(v[mask_roi > 0])
    
    # Saturation indicates ripeness (higher = more ripe for most fruits)
    sat_score = min(1.0, avg_s / 200.0)
    
    # Brightness indicates over-ripeness (very bright = over-ripe)
    if avg_v > OVERRIPE_V_MIN:
        brightness_score = min(1.0, (avg_v - OVERRIPE_V_MIN) / 105.0)
    else:
        brightness_score = 0.0
    
    # Classify based on saturation and brightness
    if sat_score < 0.3:
        return sat_score, "Unripe"
    elif sat_score < 0.5:
        return sat_score, "Under-ripe"
    elif brightness_score > 0.5:
        return sat_score, "Over-ripe"
    else:
        return sat_score, "Ripe"

def classify_health_state(label, bite, jag, spot_ratio, blob_ratio, strength, ripeness_state):
    """
    Comprehensive health classification combining damage metrics and ripeness.
    Returns: health_state (string)
    """
    
    # Severity scores (0-1)
    bite_severity = min(1.0, bite / 0.15)
    jag_severity = min(1.0, jag / 0.3)
    spot_severity = min(1.0, spot_ratio / 0.1)
    blob_severity = min(1.0, blob_ratio / 0.03)
    
    # Total damage score (weighted average)
    damage_score = (bite_severity * 0.35 + 
                   jag_severity * 0.25 + 
                   spot_severity * 0.25 + 
                   blob_severity * 0.15)
    
    # Infection indicator (very specific spots pattern)
    infection_score = 0.0
    if spot_ratio > 0.015 and blob_ratio < 0.02 and jag > 0.1:
        infection_score = min(1.0, (spot_ratio - 0.015) / 0.05)
    
    # Decode health state based on damage and ripeness
    if damage_score > 0.8:
        return "Severely Damaged"
    elif damage_score > 0.6 and bite > 0.08:
        return "Rotten"
    elif infection_score > 0.5:
        return "Infected"
    elif damage_score > 0.4:
        if ripeness_state == "Unripe":
            return "Unripe"
        elif ripeness_state == "Under-ripe":
            return "Under-ripe"
        elif ripeness_state == "Over-ripe":
            return "Over-ripe"
        else:
            return "Ripe"
    else:
        # Ripeness-based classification (minimal damage)
        return ripeness_state

def get_health_stats_string(bite, jag, spot_ratio, blob_ratio):
    """Format health metrics for display."""
    return f"b:{bite:.2f} j:{jag:.2f} s:{spot_ratio:.3f} b:{blob_ratio:.3f}"

def get_mask_for_box(r, i, frame_shape):
    """
    r: ultralytics Results
    i: index of detection
    returns: bbox (x1,y1,x2,y2), fullres mask01 (H,W)
    """
    x1, y1, x2, y2 = map(int, r.boxes.xyxy[i].tolist())
    H, W = frame_shape[:2]
    x1 = max(0, min(W-1, x1)); x2 = max(0, min(W-1, x2))
    y1 = max(0, min(H-1, y1)); y2 = max(0, min(H-1, y2))
    if x2 <= x1 or y2 <= y1:
        return None, None

    # Ultralytics segmentation: r.masks.data is (n, mask_h, mask_w) in model input scale
    if r.masks is None:
        return (x1,y1,x2,y2), None

    m = r.masks.data[i].cpu().numpy().astype(np.float32)  # 0..1
    # Resize mask to frame size
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    mask01 = (m > 0.5).astype(np.uint8)
    return (x1,y1,x2,y2), mask01

def main():
    try:
        cv2.setNumThreads(1)
    except Exception:
        pass

    print("\n" + "="*70)
    print("FARM FRUIT/VEGETABLE DETECTION - ENHANCED VERSION")
    print("="*70)
    print(f"[INFO] Model: YOLOv8-Medium Segmentation (yolov8m-seg.pt)")
    print(f"[INFO] - Medium model for SUPERIOR fruit/vegetable accuracy")
    print(f"[INFO] - Distinguishes strawberry vs broccoli, etc.")
    print(f"[INFO] - Better health state classification")
    print(f"[INFO] Input Resolution: {IMG_SZ}x{IMG_SZ}")
    print(f"[INFO] Confidence Threshold: {CONF}")
    print(f"[INFO] Processing: Every {DETECT_EVERY}th frame")
    print("="*70 + "\n")
    model = YOLO(MODEL_PATH)
    try:
        model.fuse()
    except Exception:
        pass

    print("[INFO] Connecting to IP camera...")
    grabber = FrameGrabber(IP_URL, FRAME_W, FRAME_H).start()

    # Initialize farm map tracker
    farm_map_tracker = FarmMapTracker(MAP_WIDTH, MAP_HEIGHT, FRAME_W, FRAME_H)

    last = []
    frame_id = 0

    fps_ema = 0.0
    alpha = 0.15
    t_prev = time.time()
    
    # Statistics tracking
    detection_stats = defaultdict(lambda: {"total": 0, "states": defaultdict(int)})
    
    # Multi-object tracking: Object counter per detection cycle
    frame_object_count = defaultdict(int)  # Count objects by label per frame
    current_frame_objects = {}  # Store object IDs for current frame

    print("[INFO] Starting detection loop.")
    print("[INFO] Windows: Detection | Farm Map")
    print("[INFO] Controls: q=quit | s=save both | p=stats | c=clear map")
    print("[INFO] Multi-Object Detection: ENABLED - Each object shown with ID")
    print("="*70 + "\n")
    
    while True:
        frame = grabber.read()
        if frame is None:
            time.sleep(0.005)
            continue
        frame = cv2.resize(frame, (FRAME_W, FRAME_H), interpolation=cv2.INTER_AREA)

        # Clear farm map for this frame (continuous update)
        frame_id % DETECT_EVERY == 0 and farm_map_tracker.clear()
        
        # Reset per-frame object counter for new detection cycle
        if frame_id % DETECT_EVERY == 0:
            frame_object_count = defaultdict(int)
            current_frame_objects = {}

        if frame_id % DETECT_EVERY == 0:
            results = model.predict(frame, imgsz=IMG_SZ, conf=CONF, iou=IOU, verbose=False, device="cpu", max_det=10)
            r = results[0]
            last = []
            detected_labels = []  # Track all detected labels for this frame
            if r.boxes is not None and len(r.boxes) > 0:
                for i in range(len(r.boxes)):
                    cls_id = int(r.boxes.cls[i].item())
                    label = model.names.get(cls_id, str(cls_id))
                    if label not in TARGET_LABELS:
                        continue
                    bbox, mask01 = get_mask_for_box(r, i, frame.shape)
                    if bbox is None:
                        continue
                    # Increment counter for each detected object
                    frame_object_count[label] += 1
                    detected_labels.append(label)
                    last.append((label, bbox, mask01))
            
            # Display detection summary if objects found
            if len(last) > 0:
                total_detected = sum(frame_object_count.values())
                detection_summary = f"[FRAME {frame_id}] Detected {total_detected} object(s): "
                detection_summary += " | ".join([f"{label}({frame_object_count[label]})" for label in dict.fromkeys(detected_labels)])
                print(detection_summary)

        # Track object IDs for labeling
        object_id_counter = defaultdict(int)
        
        for (label, (x1,y1,x2,y2), mask01_full) in last:
            # Assign unique ID to each object
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

            # Resize ROI + mask to square for stable thresholds
            roi_s = resize_square(roi, ROI_ANALYZE)
            mask_s = resize_square(mask_roi*255, ROI_ANALYZE)
            mask_s = (mask_s > 128).astype(np.uint8)

            mask_roi = cv2.medianBlur((mask_roi*255).astype(np.uint8), 5)
            mask_roi = (mask_roi > 128).astype(np.uint8)
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((9,9),np.uint8), iterations=1)

            # Analyze damage metrics
            bite, area, contour = bite_score_solidity(mask_s)
            jag = boundary_jaggedness(mask_s, contour)
            spot_ratio, blob_ratio, strength = spot_metrics(roi_s, mask_s)

            # Analyze ripeness color
            ripeness_score, ripeness_state = analyze_ripeness_by_color(roi_s, mask_s, label)

            # Classify overall health state
            health_state = classify_health_state(label, bite, jag, spot_ratio, blob_ratio, strength, ripeness_state)

            # Get color for visualization
            color = HEALTH_COLORS.get(health_state, HEALTH_COLORS["Unknown"])

            # Draw detection box and labels on detection window with object ID
            cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
            # Enhanced label with object ID for multi-object display
            label_text = f"[#{obj_id}] {label.upper()} - {health_state}"
            cv2.putText(frame, label_text, 
                       (x1, max(25, y1-10)), FONT, 0.75, color, 2)
            
            # Draw metrics below
            stats_str = get_health_stats_string(bite, jag, spot_ratio, blob_ratio)
            cv2.putText(frame, stats_str,
                       (x1, min(FRAME_H-10, y2+22)), FONT, 0.5, (255,255,0), 1)

            # Add to farm map at bbox center
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            farm_map_tracker.add_detection(center_x, center_y, label, health_state)

            # Update statistics
            detection_stats[label]["total"] += 1
            detection_stats[label]["states"][health_state] += 1

        # Update farm map visualization
        farm_map_tracker.update_map()
        farm_map_tracker.draw_map_info()

        # Display FPS and detection count on detection window
        t_now = time.time()
        inst_fps = 1.0 / max(1e-6, (t_now - t_prev))
        t_prev = t_now
        fps_ema = (1 - alpha) * fps_ema + alpha * inst_fps
        
        det_count = sum(stat["total"] for stat in detection_stats.values())
        current_frame_count = len(last)  # Objects on current frame
        cv2.putText(frame, f"FPS: {fps_ema:.1f} | Total: {det_count} | Frame: {current_frame_count} object(s)", 
                   (10, 30), FONT, 0.9, (255,0,0), 2)
        
        # Display current frame object breakdown
        if len(last) > 0:
            breakdown = " + ".join([f"{label}({frame_object_count[label]})" for label in sorted(set([l for l,_,_ in last]))])
            cv2.putText(frame, f"Objects: {breakdown}", 
                       (10, 55), FONT, 0.7, (0, 255, 0), 1)

        # Display legend
        cv2.putText(frame, "Health States:", (FRAME_W-250, 30), FONT, 0.6, (200,200,255), 1)
        y_offset = 50
        for state, color in list(HEALTH_COLORS.items())[:4]:
            cv2.putText(frame, state, (FRAME_W-250, y_offset), FONT, 0.5, color, 1)
            y_offset += 20
        
        # Display both windows
        cv2.imshow("LIVE Detection - IP Webcam", frame)
        cv2.imshow("FARM MAP - Top Down Layout", farm_map_tracker.get_map())
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            # Save both detection frame and farm map
            det_filename = f"detection_{frame_id}.png"
            map_filename = f"farm_map_{frame_id}.png"
            cv2.imwrite(det_filename, frame)
            farm_map_tracker.save_map(map_filename)
            print(f"[SAVED] Detection: {det_filename} | Map: {map_filename}")
        elif key == ord('c'):
            # Clear farm map
            farm_map_tracker.clear()
            print("[INFO] Farm map cleared")
        elif key == ord('p'):
            # Print statistics
            print("\n" + "="*60)
            print("DETECTION STATISTICS")
            print("="*60)
            for label, stats in sorted(detection_stats.items()):
                print(f"\n{label.upper()}:")
                print(f"  Total: {stats['total']}")
                for state, count in sorted(stats['states'].items()):
                    pct = (count / stats['total'] * 100) if stats['total'] > 0 else 0
                    print(f"    {state}: {count} ({pct:.1f}%)")
            print(f"\nTotal Crops on Map: {len(farm_map_tracker.detected_crops)}")
            print("="*60 + "\n")

        frame_id += 1

    print("\n[INFO] Shutting down...")
    grabber.stop()
    cv2.destroyAllWindows()
    
    # Save final session map
    farm_map_tracker.save_map("farm_map_final.png")
    print("[SAVED] Final farm map: farm_map_final.png")
    
    # Print final statistics
    print("\n" + "="*60)
    print("FINAL SESSION STATISTICS")
    print("="*60)
    for label, stats in sorted(detection_stats.items()):
        print(f"\n{label.upper()}:")
        print(f"  Total Detections: {stats['total']}")
        for state, count in sorted(stats['states'].items()):
            pct = (count / stats['total'] * 100) if stats['total'] > 0 else 0
            print(f"    {state}: {count} ({pct:.1f}%)")
    print("\n[INFO] Session ended successfully")
    print("="*60)

if __name__ == "__main__":
    main()

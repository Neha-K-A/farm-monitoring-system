# FarmVisionAI Developer Walkthrough

Complete technical walkthrough explaining how the entire system works.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Camera Streaming](#camera-streaming)
3. [Object Detection](#object-detection)
4. [Health Classification](#health-classification)
5. [Farm Mapping](#farm-mapping)
6. [Real-Time Visualization](#real-time-visualization)
7. [Data Flow](#data-flow)
8. [Extending the System](#extending-the-system)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FarmVisionAI System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Camera Module (ADB Stream)                             │ │
│  │ - Phone camera via ADB screencap                       │ │
│  │ - PNG frame streaming                                  │ │
│  │ - Error recovery and reconnection                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AI Detection Pipeline                                  │ │
│  │ - YOLO v8x object detection                            │ │
│  │ - Confidence filtering (0.40+)                         │ │
│  │ - Bounding box extraction                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Health Classification                                  │ │
│  │ - HSV color analysis                                   │ │
│  │ - Texture detection (Laplacian)                        │ │
│  │ - Brightness analysis                                  │ │
│  │ - Weighted scoring (50% color, 25% texture, 25% brightness) │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Farm Mapping & Coordinate Conversion                   │ │
│  │ - Frame → Map coordinate transformation                │ │
│  │ - Grid-based spatial indexing                          │ │
│  │ - Crop history tracking                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Visualization & Output                                 │ │
│  │ - Real-time detection overlay                          │ │
│  │ - Farm map rendering                                   │ │
│  │ - JSON export & PNG save                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Camera Streaming

### How It Works

The camera module (`camera/adb_camera.py`) establishes a live USB connection to an Android device and streams frames using ADB commands.

### ADB Screencap Command

```bash
adb exec-out screencap -p
```

This command:

- Captures the full phone screen in real-time
- Outputs raw PNG binary data to stdout
- Runs continuously as a pipe (not separate images)

### Frame Extraction Process

```python
# Raw byte stream from ADB
byte_stream = b'\x89PNG\x00\x00...[PNG data]...IEND\xae\x42\x60\x82'

# 1. Identify PNG boundaries
start = byte_stream.find(b'\x89PNG')
end = byte_stream.find(b'\x49\x45\x4e\x44\xae\x42\x60\x82', start) + 8

# 2. Extract PNG chunk
frame_data = byte_stream[start:end]

# 3. Decode to OpenCV format
frame_array = np.frombuffer(frame_data, dtype=np.uint8)
frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)  # BGR format
```

### Threading Model

The camera runs in a background thread to avoid blocking the main processing loop:

```
Main Thread                     Camera Thread
    │                                │
    ├─ Process frames        ←─ Capture frames
    ├─ Detect objects               │
    ├─ Classify health              │
    └─ Draw visualization     (Continuous loop)
```

**Advantages:**

- Non-blocking frame capture
- Main thread responsive to user input
- Automatic frame buffering

### Error Recovery

When connection fails:

```python
# Automatic reconnection with exponential backoff
retry_count = 0
while retry_count < MAX_RETRY_ATTEMPTS:
    if camera.reconnect():
        break
    retry_count += 1
    time.sleep(2 ** retry_count)  # 1s, 2s, 4s, 8s...
```

## Object Detection

### YOLO v8 Pipeline

```
Input Frame (1280×720)
         ↓
[Input Preprocessing]
  - Resize to 640×640
  - Normalize pixel values
         ↓
[YOLO v8x Neural Network]
  - 208 convolutional layers
  - Batch normalization
  - GELU activations
         ↓
[Output Decoding]
  - Bounding boxes (x1, y1, x2, y2)
  - Class probabilities (80 COCO classes)
  - Objectness score
         ↓
[Post-Processing]
  - Confidence filtering (0.40 threshold)
  - NMS (IoU=0.45 threshold)
         ↓
Final Detections (list of boxes)
```

### Model Details

**YOLOv8x (Extra Large)**

- Parameters: 68.2M
- Input: 640×640 RGB image
- Output: 8400 predictions (85 values each)
- Size: ~680MB
- Speed: ~35 FPS on GPU, ~5-10 FPS on CPU

### Detection Dictionary Structure

```python
detection = {
    "class": "tomato",              # Detected class name
    "confidence": 0.87,              # 0-1 confidence score
    "bbox": (100, 50, 200, 150),    # (x1, y1, x2, y2) pixels
    "center": (150, 100),            # Center coordinates
    "area": 5000,                    # Bounding box area
    "health": "healthy",             # To be filled by classifier
    "health_confidence": 0.92,       # Health classification confidence
    "health_scores": {               # Individual health scores
        "healthy": 0.92,
        "ripe": 0.15,
        "unripe": 0.08,
        "rotten": 0.02,
        "diseased": 0.05
    }
}
```

### Confidence Threshold

Detections below 0.40 confidence are ignored:

```python
if detection["confidence"] < YOLO_CONFIDENCE_THRESHOLD:
    continue  # Skip low-confidence detection
```

**Why 0.40?**

- Balances precision vs recall
- Reduces false positives significantly
- Still captures most real crops
- Can be lowered for dense crops or raised for sparse areas

## Health Classification

### Classification Pipeline

```
Crop Region (from bbox)
    ↓
[Color Analysis - HSV]
  - Convert BGR → HSV
  - Analyze hue, saturation, value ranges
  - Score each health state
  - Weight: 50%
    ↓
[Texture Analysis - Laplacian]
  - Calculate Laplacian variance (sharpness)
  - Detect edges (Canny)
  - Calculate edge density
  - Weight: 25%
    ↓
[Brightness Analysis - Grayscale]
  - Analyze mean brightness
  - Calculate brightness std deviation
  - Score health based on brightness ranges
  - Weight: 25%
    ↓
[Score Combination]
  - Weighted average: 0.5*color + 0.25*texture + 0.25*brightness
  - Final score: 0-1
    ↓
Final Health Classification
```

### HSV Color Ranges

```python
HEALTH_STATES = {
    "healthy": {
        "h": (35, 85),      # Green hues
        "s": (40, 255),     # Medium-high saturation
        "v": (50, 255)      # Medium-high brightness
    },
    "ripe": {
        "h": (0, 20),       # Red hues
        "s": (80, 255),     # High saturation
        "v": (100, 255)     # High brightness
    },
    "unripe": {
        "h": (35, 85),      # Green hues
        "s": (50, 255),     # Lower saturation
        "v": (80, 200)      # Lower brightness
    },
    "rotten": {
        "h": (0, 10),       # Dark red/brown
        "s": (50, 255),     # Variable saturation
        "v": (30, 150)      # Very low brightness
    }
}
```

### Example Classification

**Input:** Tomato with bbox

```
1. Color Analysis
   - HSV mean: h=8, s=220, v=180
   - "ripe" score: 0.95 (matches red range well)
   - "healthy" score: 0.15 (less green)
   - Result: 0.95 → ripe

2. Texture Analysis
   - Laplacian variance: 850 (good edges)
   - "ripe" score: 0.80
   - Result: 0.80 → ripe

3. Brightness Analysis
   - Brightness: 185 (high)
   - "ripe" score: 0.85 (matches bright ripe range)
   - Result: 0.85 → ripe

4. Combined Score
   - Final = 0.5×0.95 + 0.25×0.80 + 0.25×0.85 = 0.89
   - Classification: RIPE (89% confidence)
```

## Farm Mapping

### Coordinate Systems

**Frame Coordinates:** The camera image space

- Origin (0,0) at top-left
- X increases right, Y increases down
- Range: (0,0) to (1280,720)

**Map Coordinates:** The farm visualization space

- Origin (0,0) at top-left
- X increases right, Y increases down
- Range: (0,0) to (1200,1200)

### Coordinate Transformation

```python
# Frame → Map conversion
scale_x = map_width / frame_width = 1200 / 1280 = 0.9375
scale_y = map_height / frame_height = 1200 / 720 = 1.667

# Example conversion
frame_center = (640, 360)  # Center of frame
map_x = 640 * 0.9375 = 600
map_y = 360 * 1.667 = 600
map_center = (600, 600)    # Center of map
```

### Spatial Indexing with Grid

The farm map uses a grid system for efficient spatial queries:

```
Map (1200×1200)
├─ Grid size: 100 pixels
├─ Grid dimensions: 12×12 cells
├─ Cell [0,0]: pixels (0,0) to (100,100)
├─ Cell [6,6]: pixels (600,600) to (700,700)  ← Detection here
└─ Cell [11,11]: pixels (1100,1100) to (1200,1200)
```

**Advantages:**

- O(1) lookup for crops at a location
- Fast nearest-neighbor searches
- Efficient population density queries
- Can skip empty regions

### Crop History

Each detected crop is stored with metadata:

```python
crop_entry = {
    "id": 42,
    "class": "tomato",
    "health": "ripe",
    "confidence": 0.87,
    "frame_coords": (150, 300),      # Where in camera frame
    "map_coords": (141, 500),        # Where on farm map
    "timestamp": "2026-03-05T14:30:15",
    "bbox": (100, 250, 200, 350),
    "detection_data": {...}          # Full detection info
}
```

### Real-World Distance Calculation

```python
# Convert pixel distance to real-world meters
REAL_WORLD_SCALE = 0.5  # 0.5 meters per pixel (configurable)

pixel_distance = 100  # pixels
real_distance = (pixel_distance / avg_scale) * REAL_WORLD_SCALE
# real_distance ≈ 42 meters
```

## Real-Time Visualization

### Detection Window

Overlays detections on the live camera frame:

```
┌─────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐ │
│  │ tomato 0.92  │  │ potato 0.87  │ │
│  │ healthy      │  │ ripe         │ │
│  └──────────────┘  └──────────────┘ │
│                                      │
│  Statistics:                         │
│  Total: 42                           │
│  Healthy: 28                         │
│  Ripe: 8                             │
│  Unripe: 4                           │
│  Rotten: 2                           │
└─────────────────────────────────────┘
```

### Farm Map Display

Top-down visualization of crop locations:

```
┌────────────────────────────────────────┐
│ Farm Map - Top-Down View               │
├────────────────────────────────────────┤
│                                         │
│  ● = Healthy (Green)                   │
│  ● = Ripe (Yellow)                     │
│  ● = Unripe (Blue)                     │
│  ● = Rotten (Red)                      │
│                                         │
│  Grid shows 100px cells                │
│  Each dot = one crop                   │
│                                         │
│ ┌─ Health Status ────────────┐         │
│ │ Healthy                     │         │
│ │ Ripe                        │         │
│ │ Unripe                      │         │
│ │ Rotten                      │         │
│ │ Diseased                    │         │
│ └─────────────────────────────┘         │
│                                         │
└────────────────────────────────────────┘
```

### Color Scheme (BGR Format)

```python
HEALTH_STATES = {
    "healthy": (0, 255, 0),      # Green
    "ripe": (0, 255, 255),       # Yellow
    "unripe": (255, 0, 0),       # Blue
    "rotten": (0, 0, 255),       # Red
    "diseased": (255, 0, 255)    # Magenta
}
```

## Data Flow

### Complete Pipeline Per Frame

```
1. [CAPTURE] ─────────────────────────────────────────
   Camera frame (1280×720, BGR) arrives from ADB

2. [DETECT] ──────────────────────────────────────────
   YOLO v8x processes frame
   Output: List of bounding boxes with confidence

3. [CLASSIFY] ────────────────────────────────────────
   For each detection:
     - Analyze color (HSV)
     - Analyze texture (Laplacian)
     - Analyze brightness
     - Combine scores → health classification

4. [MAP] ─────────────────────────────────────────────
   For each detection:
     - Convert bbox center from frame → map coordinates
     - Store in FarmMapper with timestamp
     - Add to GridMapper for spatial indexing

5. [VISUALIZE] ───────────────────────────────────────
   Detection window:
     - Draw bounding boxes
     - Add labels (class, confidence, health)
     - Draw statistics overlay

   Farm map:
     - Create grid background
     - Draw crop circles at map locations
     - Color by health status
     - Add legend and statistics

6. [OUTPUT] ──────────────────────────────────────────
   On-demand (press 's'):
     - detections.json: Crop data exported
     - farm_map.png: Visualization saved
     - statistics.json: Session stats saved
```

### Example Detection Flow

```json
[CAPTURED FRAME]
{
  "width": 1280,
  "height": 720,
  "format": "BGR"
}
    ↓
[DETECTION RESULTS]
{
  "detections": [
    {
      "bbox": [100, 50, 200, 150],
      "class": "tomato",
      "confidence": 0.92,
      "class_id": 5
    }
  ]
}
    ↓
[HEALTH CLASSIFICATION]
{
  "health": "ripe",
  "confidence": 0.89,
  "scores": {
    "healthy": 0.15,
    "ripe": 0.89,
    "unripe": 0.08,
    "rotten": 0.02,
    "diseased": 0.05
  }
}
    ↓
[MAPPING]
Frame center: (150, 100)
Map center: (141, 167)  # Due to scaling

Stored as:
{
  "id": 1,
  "class": "tomato",
  "health": "ripe",
  "frame_coords": [150, 100],
  "map_coords": [141, 167],
  "timestamp": "2026-03-05T14:30:15.123456"
}
    ↓
[VISUALIZATION]
- Draw green box on detection window
- Draw dot on farm map
- Update statistics counters
```

## Extending the System

### Adding New Crop Types

**Option 1: Use existing YOLO classes**

YOLO v8 is trained on COCO dataset (80 classes) including:

- apple, banana, orange, broccoli, carrot, potted plant, etc.

Just detect them naturally - no changes needed!

**Option 2: Fine-tune YOLO on custom dataset**

```python
from ultralytics import YOLO

# Load base model
model = YOLO('yolov8x.pt')

# Train on your custom crops
results = model.train(
    data='data.yaml',  # Your custom dataset
    epochs=100,
    imgsz=640,
    device=0  # GPU
)

# Save custom model
custom_model = 'runs/detect/train/weights/best.pt'
```

In `main.py`:

```python
self.detector = ObjectDetector(model_path='path/to/custom_model.pt')
```

### Replacing Health Classifier with CNN

The codebase is designed for easy CNN integration:

```python
# Create CNN model (e.g., using PyTorch)
class CropHealthCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = # ... your CNN architecture
        self.classifier = # ... classification head

    def forward(self, x):
        return self.classifier(self.features(x))

# In ai/health_classifier.py
class CNNHealthClassifier:
    def __init__(self, model_path):
        self.model = torch.load(model_path)

    def classify(self, crop_region):
        # Preprocess image
        x = self.preprocess(crop_region)
        # Run inference
        logits = self.model(x)
        # Get predictions
        health = self.postprocess(logits)
        return health

# In main.py
# Just swap the classifier:
# self.health_classifier = CNNHealthClassifier('path/to/model.pth')
```

### Adding GPS Integration

To track real-world location of crops:

```python
# In camera/adb_camera.py
def get_gps_location(self):
    """Get device GPS location"""
    result = subprocess.run(
        [f"adb -s {self.device_id} shell", "getprop ro.com.google.clientidbase"],
        capture_output=True, text=True
    )
    # Parse and return GPS coordinates

# In main.py
gps_coords = camera.get_gps_location()
farm_mapper.add_crop(
    detection,
    bbox_center,
    gps_coordinates=gps_coords  # Add GPS location
)
```

### Drone Integration

To use with drone camera instead of phone:

```python
# Create new module: camera/drone_camera.py
class DroneCamera:
    def __init__(self, drone_api):
        self.api = drone_api  # DJI, Parrot, etc.

    def get_frame(self):
        frame = self.api.get_video_frame()
        return cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

# In main.py
# Replace: self.camera = ADBCamera()
# With: self.camera = DroneCamera(drone_api)
```

### 3D Reconstruction

To build 3D farm model:

```python
# Create new module: mapping/reconstruction_3d.py
class ThreeDReconstructor:
    def __init__(self):
        self.structure_from_motion = None

    def add_frame(self, frame, pose):
        """Add frame with camera pose"""
        self.structure_from_motion.add_frame(frame, pose)

    def build_model(self):
        """Build 3D point cloud"""
        return self.structure_from_motion.get_point_cloud()

# In main.py
reconstructor = ThreeDReconstructor()
# Track poses, add frames, generate 3D model
```

### Disease Detection CNN

Train separate CNN for disease identification:

```python
class DiseaseDetectionCNN:
    def __init__(self, model_path):
        self.model = load_model(model_path)
        self.diseases = [
            "early_blight",
            "late_blight",
            "leaf_spot",
            "powdery_mildew",
            "healthy"
        ]

    def detect_disease(self, crop_region):
        prediction = self.model.predict(crop_region)
        disease = self.diseases[prediction.argmax()]
        confidence = prediction.max()
        return disease, confidence

# In main.py
disease_detector = DiseaseDetectionCNN('path/to/model.h5')
disease, conf = disease_detector.detect_disease(crop_region)
detection['disease'] = disease
detection['disease_confidence'] = conf
```

### Yield Prediction

Estimate crop yield from health distribution:

```python
class YieldPredictor:
    @staticmethod
    def estimate_yield(crop_stats, crop_type):
        """
        Estimate yield from crop distribution

        Args:
            crop_stats: dict with healthy/ripe/rotten counts
            crop_type: str like "tomato", "potato"
        """
        # Yield models per crop type
        models = {
            "tomato": lambda h, r, u, rot: h*5 + r*3 + u*0.5,  # kg per plant
            "potato": lambda h, r, u, rot: h*2 + r*1.5 + u*0.2,
            # ... more crops
        }

        h = crop_stats['healthy']
        r = crop_stats['ripe']
        u = crop_stats['unripe']
        rot = crop_stats['rotten']

        if crop_type in models:
            yield_kg = models[crop_type](h, r, u, rot)
            return yield_kg
        return 0

# In main.py
stats = farm_mapper.get_crop_statistics()
yield_tomato = YieldPredictor.estimate_yield(
    {k: stats.get(k, 0) for k in ['healthy', 'ripe', 'unripe', 'rotten']},
    'tomato'
)
```

## Performance Considerations

### Bottlenecks

1. **Model Inference** (~70% time)
   - Solution: Use smaller model (yolov8s/yolov8m)
   - Or: Skip frames (process every 2nd/3rd)

2. **Frame Capture** (~15% time)
   - Solution: Use threaded camera (already done)
   - Or: Reduce resolution

3. **Visualization** (~10% time)
   - Solution: Skip map updates
   - Or: Use headless mode

4. **Health Classification** (~5% time)
   - Solution: Replace with CNN (faster)

### Optimization Tips

```python
# 1. Use faster model variant
YOLO_MODEL_NAME = "yolov8m.pt"  # Medium instead of Extra-large

# 2. Skip more frames
FRAME_SKIP = 4  # Process every 4th frame

# 3. Reduce input size
YOLO_IMAGE_SIZE = 416  # Instead of 640

# 4. Enable GPU
YOLO_DEVICE = "0"  # GPU index

# 5. Disable visualization
cv2.imshow(...)  # Comment out update-heavy calls
```

## Debugging & Monitoring

### Logging

All components log to `output/logs/farm_vision.log`:

```
2026-03-05 14:30:00,123 - camera.adb_camera - INFO - Frame capture thread started
2026-03-05 14:30:01,456 - ai.detector - INFO - Model loaded successfully
2026-03-05 14:30:02,789 - main - INFO - Detection: tomato@0.92 → ripe
```

### Statistics Monitoring

```python
stats = farm_mapper.get_crop_statistics()
print(f"Total crops: {stats['total_detections']}")
print(f"Healthy: {stats['healthy']}")
print(f"Average confidence: {stats['average_confidence']:.2f}")
```

### Performance Profiling

```python
import time

start = time.time()
detections = detector.detect(frame)
detect_time = time.time() - start
print(f"Detection: {detect_time*1000:.1f}ms")

start = time.time()
health_classifier.classify_batch(frame, detections)
classify_time = time.time() - start
print(f"Classification: {classify_time*1000:.1f}ms")
```

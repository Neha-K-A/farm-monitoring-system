# FarmVisionAI Debugging Guide

Complete troubleshooting guide for all common issues and advanced debugging techniques.

## Table of Contents

1. [ADB Connection Issues](#adb-connection-issues)
2. [Camera Frame Errors](#camera-frame-errors)
3. [Model Loading Problems](#model-loading-problems)
4. [Detection Issues](#detection-issues)
5. [Performance Problems](#performance-problems)
6. [Visualization Issues](#visualization-issues)
7. [Advanced Debugging](#advanced-debugging)
8. [Logs & Diagnostics](#logs--diagnostics)

## ADB Connection Issues

### Symptom: "No devices found"

**Command Output:**

```bash
$ adb devices
List of attached devices

$ (empty list)
```

**Diagnosis Checklist:**

1. **Check USB connection physically**

   ```bash
   # Windows - List USB devices
   wmic logicaldisk get name

   # macOS
   system_profiler SPUSBDataType

   # Linux
   lsusb
   ```

2. **Verify ADB is installed**

   ```bash
   adb --version
   # Should output: Android Debug Bridge version X.X.X
   ```

3. **Check if device is recognized by OS**
   - Windows: Device Manager → Android devices/USB devices
   - macOS: System Report → USB
   - Linux: `lsusb | grep -i android`

4. **Restart ADB daemon**

   ```bash
   adb kill-server
   sleep 2
   adb start-server
   adb devices
   ```

5. **Check developer mode on phone**
   - Settings → About Phone → tap Build Number 7 times
   - Settings → Developer Options (should now appear)
   - Enable "USB Debugging"

6. **Allow USB Debugging Permission**
   - Phone should show prompt: "Allow USB debugging?"
   - Tap "Always allow from this computer"
   - Tap "Allow"

7. **Try different USB port**
   - Use USB 2.0 port (avoid 3.1 if possible)
   - Avoid USB hubs
   - Try rear ports on desktop

**Advanced Solutions:**

```bash
# List all ADB sessions
adb devices -l

# Get device details
adb -s {DEVICE_ID} shell getprop ro.build.version.release

# Check USB permissions (Linux)
lsusb
# If permission denied:
sudo usermod -a -G plugdev $USER

# Clear ADB cache (Windows)
del %USERPROFILE%\.android\adb_key*

# Restart USB subsystem (Windows)
# Device Manager → USB controllers → right-click → Uninstall
# Disconnect phone, reconnect
```

### Symptom: "Device shows offline"

**Solution:**

```bash
adb devices
# Shows: {DEVICE_ID}    offline

# Try these in order:
1. adb kill-server && adb devices

2. Unplug phone, wait 2 seconds, plug back in

3. On phone, revoke USB debugging:
   Settings → Developer Options → Revoke USB debugging authorizations
   Then enable again and allow when prompt appears

4. Clear ADB on device:
   adb shell rm -rf ~/.android/adb_keys

5. Force authorization:
   adb connect {DEVICE_ID}
   adb authorize
```

### Symptom: "Permission denied" error

**Error Message:**

```
error: insufficient permissions for device: insufficient permissions
```

**Solution:**

**Windows:**

```bash
# Run Command Prompt as Administrator
# Then:
adb kill-server
adb devices  # Run as admin
```

**Linux:**

```bash
# Add udev rules
sudo curl https://raw.githubusercontent.com/M0Rf30/android-udev-rules/main/51-android.rules -o /etc/udev/rules.d/51-android.rules

# Reload rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# Add user to group
sudo usermod -a -G plugdev $USER

# Logout and login
```

**macOS:**

```bash
# Usually works without additional setup
# If not, try:
killall -9 usbmuxd
adb kill-server
adb devices
```

## Camera Frame Errors

### Symptom: "Timeout waiting for camera frames"

**Error Message:**

```
Timeout waiting for camera frames
Failed to start camera
```

**Causes & Solutions:**

1. **Device screen is locked**
   - Unlock phone
   - Keep it unlocked during scanning

2. **Screen rotation lock enabled**
   - Pull down quick settings
   - Disable "Auto-rotate" or "Rotation lock"

3. **ADB screencap not working**

   ```bash
   # Test directly:
   adb shell screencap -p /sdcard/test.png
   adb pull /sdcard/test.png

   # If fails, phone permissions issue
   ```

4. **USB cable issues**
   - Try different cable (high-speed recommended)
   - Avoid USB extensions/hubs
   - Check for physical damage

5. **Phone USB settings**
   - On phone, confirm it shows "USB for charging"
   - If "File transfer" or "PTP" mode, change to charging mode

**Debugging Steps:**

```bash
# 1. Test ADB connection
adb devices -l

# 2. Test screencap command
adb shell screencap -p | head -c 20
# Should output: 89 50 4e 47 0d 0a 1a 0a (PNG header in hex)

# 3. Check if screen is interactive
adb shell input tap 100 100

# 4. Check device resolution
adb shell wm size

# 5. Try manual screencap to file
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```

### Symptom: "Frame decode error"

**Log Message:**

```
Frame decode error: ...
Stream read error: Connection reset by peer
```

**Solutions:**

1. **Increase timeout**
   - Edit `utils/config.py`

   ```python
   FRAME_TIMEOUT = 10  # Increase from 5
   ADB_TIMEOUT = 15    # Increase from 10
   ```

2. **Reduce frame processing**

   ```python
   FRAME_SKIP = 3  # Skip more frames
   CAMERA_FRAME_WIDTH = 640  # Smaller resolution
   CAMERA_FRAME_HEIGHT = 480
   ```

3. **Restart ADB**

   ```bash
   adb kill-server
   python main.py  # Will restart automatically
   ```

4. **Check USB bandwidth**
   - Close other USB-heavy apps
   - Check `adb shell` responsiveness:
   ```bash
   time adb shell "for i in {1..10}; do screencap -p > /dev/null; done"
   # Should complete in < 5 seconds
   ```

### Symptom: "Dropped frames" messages

**Log shows:**

```
Frame processing error: ...
Stream ended, attempting reconnect
```

**This is normal but can be improved:**

```python
# In utils/config.py
MAX_RETRY_ATTEMPTS = 5  # Increase from 3
RETRY_DELAY = 0.5      # Decrease from 1 (faster reconnect)

# Also improve threading:
THREAD_TIMEOUT = 5     # Increase from 10 (more responsive)
```

## Model Loading Problems

### Symptom: "Model file not found"

**Error Message:**

```
FileNotFoundError: models/yolov8x.pt not found
Attempting to download...
```

**Solutions:**

1. **Check internet connection**

   ```bash
   ping github.com
   ```

2. **Check free disk space**

   ```bash
   # Windows
   dir C:\

   # macOS/Linux
   df -h .
   # Need at least 1GB free
   ```

3. **Manual download**
   - Go to: https://github.com/ultralytics/assets/releases/tag/v8.0.0
   - Download `yolov8x.pt` (685 MB)
   - Place in `FarmVisionAI/models/yolov8x.pt`

4. **Pre-download in Python**
   ```bash
   python -c "from ultralytics import YOLO; YOLO('yolov8x.pt')"
   ```

### Symptom: "CUDA out of memory"

**Error Message:**

```
RuntimeError: CUDA out of memory
```

**Solutions:**

1. **Use CPU instead of GPU**
   - Edit `utils/config.py`

   ```python
   YOLO_DEVICE = "cpu"  # Change from "0"
   ```

2. **Use smaller model**

   ```python
   YOLO_MODEL_NAME = "yolov8m.pt"  # Medium instead of Extra-large
   ```

3. **Reduce batch size** (in detector.py)

   ```python
   results = self.model(..., batch=16)  # If batch processing
   ```

4. **Clear GPU cache**
   ```bash
   python -c "import torch; torch.cuda.empty_cache()"
   ```

### Symptom: "Unknown library error"

**Error Message:**

```
ImportError: No module named 'ultralytics'
```

**Solutions:**

1. **Verify Python environment**

   ```bash
   python --version  # Should be 3.8+
   pip --version
   ```

2. **Reinstall requirements**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Install individually**

   ```bash
   pip install ultralytics --no-cache-dir
   pip install opencv-python --no-cache-dir
   pip install torch torchvision --no-cache-dir
   ```

4. **Check Python environment**
   ```bash
   # Make sure using correct Python
   which python  # Should point to your venv/installation
   python -m pip list | grep ultralytics
   ```

## Detection Issues

### Symptom: "No detections found"

**Problem:** Bounding boxes not appearing in output

**Checklist:**

1. **Verify model is loaded**
   - Check logs for "Model loaded successfully"
   - Run test detection:

   ```bash
   python -c "
   from ai.detector import ObjectDetector
   det = ObjectDetector()
   print(det.get_model_info())
   "
   ```

2. **Test on sample image**
   - Save a frame from camera
   - Run detection separately:

   ```bash
   python -c "
   import cv2, numpy as np
   from ai.detector import ObjectDetector

   det = ObjectDetector()
   frame = cv2.imread('test_frame.jpg')
   detections = det.detect(frame)
   print(f'Found {len(detections)} detections')
   for d in detections:
       print(f\"  {d['class']}: {d['confidence']:.2f}\")
   "
   ```

3. **Check confidence threshold**
   - Lower threshold if too restrictive:

   ```python
   # In utils/config.py
   YOLO_CONFIDENCE_THRESHOLD = 0.30  # Lower from 0.40
   ```

4. **Verify camera image quality**
   - Ensure good lighting
   - Check focus (not blurry)
   - Verify crops are visible
   - Check camera distance (too far/close?)

5. **Check model input size**
   ```python
   # In utils/config.py, try different size
   YOLO_IMAGE_SIZE = 416  # Try smaller input
   # or
   YOLO_IMAGE_SIZE = 512  # Try middle ground
   ```

### Symptom: "Too many false positives"

**Problem:** Detecting non-crops or background as crops

**Solutions:**

1. **Increase confidence threshold**

   ```python
   YOLO_CONFIDENCE_THRESHOLD = 0.60  # Raise from 0.40
   ```

2. **Increase IoU threshold** (reduces overlapping boxes)

   ```python
   # In ai/detector.py, _detect method:
   results = self.model(..., iou=0.6)  # Raise from 0.45
   ```

3. **Use smaller model** (more precise)

   ```python
   YOLO_MODEL_NAME = "yolov8m.pt"  # More conservative
   ```

4. **Filter by size**
   - Edit ai/detector.py
   ```python
   def _parse_results(self, result, frame):
       for box in result.boxes:
           area = (x2 - x1) * (y2 - y1)
           if area < 500:  # Minimum 500 pixels²
               continue
           detections.append(...)
   ```

### Symptom: "Health classification always shows same result"

**Problem:** All crops classified as "healthy" or same state

**Debugging:**

```bash
# Test classifier directly
python -c "
import cv2, numpy as np
from ai.health_classifier import HealthClassifier
from ai.detector import ObjectDetector

frame = cv2.imread('test_frame.jpg')
classifier = HealthClassifier()
detector = ObjectDetector()

detections = detector.detect(frame)
for det in detections:
    health_result = classifier.classify(frame, det['bbox'])
    print(f\"Scores: {health_result['scores']}\")
    print(f\"Classification: {health_result['health']}\")
"
```

**Solutions:**

1. **Adjust HSV ranges**
   - Edit `utils/config.py` HSV_RANGES
   - Expand ranges that are too restrictive

2. **Adjust scoring weights**
   - Edit `ai/health_classifier.py` \_combine_scores()

   ```python
   color_weight = 0.6      # Increase color importance
   texture_weight = 0.2
   brightness_weight = 0.2
   ```

3. **Use CNN classifier instead**
   - Replace hybrid classifier with trained CNN

## Performance Problems

### Symptom: "Low FPS (< 10)"

**Diagnosis:**

```bash
# Check system resources
# Windows
tasklist /v

# macOS
top -n 10

# Linux
top -b -n 1 | head -20
```

**Solutions (in order of effectiveness):**

1. **Use GPU**

   ```python
   YOLO_DEVICE = "0"  # GPU index
   ```

2. **Use smaller model**

   ```python
   YOLO_MODEL_NAME = "yolov8s.pt"  # Small (22 MB)
   # vs
   YOLO_MODEL_NAME = "yolov8x.pt"  # Extra-large (680 MB)
   ```

3. **Skip more frames**

   ```python
   FRAME_SKIP = 4  # Process every 4th frame
   ```

4. **Reduce input resolution**

   ```python
   YOLO_IMAGE_SIZE = 416  # From 640
   CAMERA_FRAME_WIDTH = 640   # From 1280
   CAMERA_FRAME_HEIGHT = 480  # From 720
   ```

5. **Disable visualization**

   ```python
   # In main.py, comment out:
   # cv2.imshow(WINDOW_DETECTION, frame_vis)
   # cv2.imshow(WINDOW_MAP, farm_map)
   ```

6. **Increase frame skip in camera**

   ```python
   FRAME_SKIP = 5  # In config.py
   TARGET_FPS = 10  # From 15
   ```

7. **Profile to find bottleneck**
   ```bash
   python -m cProfile -s cumtime main.py | head -30
   ```

### Symptom: "Memory usage increasing over time"

**Cause:** Memory leak or unbounded growth

**Debugging:**

```bash
# Monitor memory
python -m memory_profiler main.py

# Or use system monitor
# Windows: tasklist /v | grep Python
# macOS: memory_usage | grep python
# Linux: ps aux | grep python
```

**Solutions:**

1. **Clear detection history periodically**

   ```python
   # In main.py
   if self.farm_mapper.crops > 1000:
       self.farm_mapper.clear_old_crops(age_seconds=300)
   ```

2. **Limit detection buffer**

   ```python
   # In ai/detector.py
   if len(self.history) > self.max_history:
       self.history = self.history[-self.max_history:]
   ```

3. **Disable history**
   ```python
   # In main.py
   # self.detection_buffer = None  # Don't store history
   ```

## Visualization Issues

### Symptom: "Windows not appearing"

**Solutions:**

1. **Check if headless mode**
   - Make sure not running via SSH without display forwarding

2. **Check window manager (Linux)**

   ```bash
   echo $DISPLAY
   # Should show :0 or similar, not empty
   ```

3. **Minimal test**

   ```bash
   python -c "
   import cv2
   import numpy as np

   img = np.zeros((720, 1280, 3), dtype=np.uint8)
   cv2.imshow('Test', img)
   cv2.waitKey(0)
   "
   ```

4. **Check display settings**
   - Ensure monitor is on
   - Check multiple monitors setup

### Symptom: "Frames not updating"

**Problem:** Window shows but image is frozen

**Solutions:**

```python
# Ensure proper frame retrieval:
frame = self.camera.get_frame()
if frame is None:
    logger.warning("No frame available")
    continue
```

1. **Check camera is streaming**

   ```bash
   # In camera module, verify:
   logger.info(f"Has frame: {camera.has_frame()}")
   logger.info(f"Is streaming: {camera.is_streaming()}")
   ```

2. **Check frame size**

   ```python
   frame = self.camera.get_frame()
   print(f"Frame shape: {frame.shape}")  # Should be (720, 1280, 3)
   ```

3. **Verify drawing functions**
   ```python
   # Test visualization directly
   visualizer = Visualizer(1280, 720)
   farm_map = visualizer.create_farm_map(1200, 1200)
   cv2.imshow("Test Map", farm_map)
   cv2.waitKey(0)
   ```

## Advanced Debugging

### Enable Verbose Logging

```python
# In utils/config.py
DEBUG_MODE = True
VERBOSE_LOGGING = True
LOG_LEVEL = logging.DEBUG

# In each module's __init__:
logger = get_logger(__name__)
logger.setLevel(logging.DEBUG)
```

### Create Debug Checkpoint System

```python
# Add to main.py
def save_debug_frame(frame, detections, checkpoint_name):
    """Save frame with detections for debugging"""
    vis = Visualizer(frame.shape[1], frame.shape[0])
    debug_frame = vis.draw_detections(frame, detections)

    debug_path = Path("output/debug") / f"{checkpoint_name}.jpg"
    debug_path.parent.mkdir(exist_ok=True)
    cv2.imwrite(str(debug_path), debug_frame)

    logger.info(f"Saved debug frame: {debug_path}")

# Usage:
save_debug_frame(frame, detections, f"frame_{self.frame_count}")
```

### Manual Testing Each Component

```bash
# 1. Test camera
python -c "
from camera.adb_camera import ADBCamera
cam = ADBCamera()
cam.start()
import time
time.sleep(2)
frame = cam.get_frame()
print(f'Got frame: {frame.shape if frame is not None else None}')
cam.stop()
"

# 2. Test detector
python -c "
from ai.detector import ObjectDetector
import cv2
det = ObjectDetector()
frame = cv2.imread('test_frame.jpg')
results = det.detect(frame)
print(f'Detections: {len(results)}')
"

# 3. Test classifier
python -c "
from ai.health_classifier import HealthClassifier
import cv2
clf = HealthClassifier()
frame = cv2.imread('test_frame.jpg')
result = clf.classify(frame, (100, 50, 200, 150))
print(f'Health: {result[\"health\"]}')
"

# 4. Test mapper
python -c "
from mapping.farm_mapper import FarmMapper
mapper = FarmMapper(1280, 720)
mapper.add_crop({'class': 'tomato', 'health': 'ripe', 'confidence': 0.9}, (640, 360))
stats = mapper.get_crop_statistics()
print(f'Stats: {stats}')
"

# 5. Test visualization
python -c "
from utils.visualization import Visualizer
import numpy as np
vis = Visualizer(1280, 720)
farm_map = vis.create_farm_map(1200, 1200)
print(f'Created map: {farm_map.shape}')
"
```

## Logs & Diagnostics

### Log File Location

```
FarmVisionAI/output/logs/farm_vision.log
```

### Reading Logs

```bash
# View last 50 lines
tail -50 output/logs/farm_vision.log

# View specific error
grep ERROR output/logs/farm_vision.log

# View recent activity
tail -f output/logs/farm_vision.log  # Real-time
```

### Diagnostic Export

```bash
# Generate diagnostics report
python -c "
import sys, platform
from pathlib import Path

print('=== FarmVisionAI Diagnostics ===')
print(f'Python: {platform.python_version()}')
print(f'Platform: {platform.system()} {platform.release()}')

# Check dependencies
deps = ['cv2', 'numpy', 'ultralytics', 'torch', 'sklearn']
for dep in deps:
    try:
        mod = __import__(dep)
        ver = getattr(mod, '__version__', 'unknown')
        print(f'{dep}: {ver} ✓')
    except ImportError:
        print(f'{dep}: MISSING ✗')

# Check files
files = [
    'main.py', 'camera/adb_camera.py', 'ai/detector.py',
    'ai/health_classifier.py', 'mapping/farm_mapper.py',
    'utils/config.py', 'utils/visualization.py'
]
for f in files:
    p = Path(f)
    status = '✓' if p.exists() else '✗'
    print(f'{f}: {status}')

# Check ADB
import subprocess
try:
    result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
    print(f'ADB: ✓')
    print(f'Connected devices: {result.stdout.count(\"device\") - 1}')
except:
    print('ADB: ✗')
" > diagnostics.txt
cat diagnostics.txt
```

### Creating Test Cases

```python
# tests/test_detector.py
import unittest
import cv2
from ai.detector import ObjectDetector

class TestDetector(unittest.TestCase):
    def setUp(self):
        self.detector = ObjectDetector()

    def test_detect_not_none(self):
        frame = cv2.imread('test_images/tomato.jpg')
        results = self.detector.detect(frame)
        self.assertIsNotNone(results)

    def test_detect_returns_list(self):
        frame = cv2.imread('test_images/tomato.jpg')
        results = self.detector.detect(frame)
        self.assertIsInstance(results, list)

if __name__ == '__main__':
    unittest.main()
```

Run tests:

```bash
python -m pytest tests/ -v
```

## Quick Reference Table

| Issue               | Quick Fix                                     |
| ------------------- | --------------------------------------------- |
| No devices detected | `adb kill-server && adb devices`              |
| Camera timeout      | Unlock phone, check USB cable                 |
| Model not found     | Check internet, 1GB free space                |
| No detections       | Lower confidence threshold, check lighting    |
| Low FPS             | Use GPU, smaller model, increase frame skip   |
| Memory leak         | Restart app every 30 mins, limit history      |
| False positives     | Raise confidence threshold, use smaller model |
| Health always same  | Adjust HSV ranges, increase weights           |
| Frozen window       | Check camera is streaming, verify PNG decode  |

## Getting Help

When reporting issues, include:

1. **Error message** (full traceback)
2. **Environment** (Python version, OS, device)
3. **Steps to reproduce**
4. **Relevant log lines** from `output/logs/farm_vision.log`
5. **Output of diagnostics** script above
6. **Sample test images** if detection issue

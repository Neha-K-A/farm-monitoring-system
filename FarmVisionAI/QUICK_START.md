# FarmVisionAI Quick Start Guide

Get FarmVisionAI up and running in 5 minutes.

## Prerequisites Checklist

- [ ] Python 3.8+ installed (`python --version`)
- [ ] IP Camera (Android IP Webcam app, RTSP, or similar)
- [ ] Computer and camera on same network
- [ ] Camera URL accessible from computer
- [ ] 1GB free disk space for YOLO model

## Quick Camera Setup (2 minutes)

### Option A: Android Phone with IP Webcam App (EASIEST)

1. Download [IP Webcam app](https://play.google.com/store/apps/details?id=com.pas.webcam)
2. Open app on phone
3. Press "Start server"
4. Note the URL shown (e.g., `http://192.168.1.45:8080`)
5. Use this URL in step 3 below

### Option B: Use Existing IP Camera

1. Find camera IP on your network
2. Check camera docs for stream URL
3. Typical formats:
   - RTSP: `rtsp://192.168.1.100:554/stream`
   - HTTP: `http://192.168.1.100:8080/video`

See [IP_CAMERA_SETUP.md](IP_CAMERA_SETUP.md) for detailed setup.

## 5-Minute Setup

### Step 1: Navigate to FarmVisionAI folder

```bash
cd FarmVisionAI
```

### Step 2: Install dependencies

```bash
pip install -r requirements.txt
```

**Takes 5-10 minutes** depending on internet speed.

### Step 3: Test camera connection

```bash
# Test your IP camera URL works
python -c "
import cv2
url = 'http://YOUR_CAMERA_IP:8080/video'
cap = cv2.VideoCapture(url)
ret, frame = cap.read()
if ret:
    print('✓ Camera works!')
else:
    print('✗ Camera not accessible')
cap.release()
"
```

### Step 4: Run the system

```bash
python main.py
```

When prompted, enter your IP camera URL:

```
http://192.168.1.45:8080/video
```

**Two windows appear:**

1. Detection window - Live camera with crop detection
2. Farm map - Top-down visualization

### Step 5: Scan your farm

Hold camera at 45-60° angle above crops, move slowly across field.

**Keyboard controls:**

- **q** = Quit
- **s** = Save outputs (detections.json, farm_map.png)
- **c** = Clear map
- **p** = Print statistics

## First Run Checklist

✓ Model downloads automatically (~680 MB)
✓ Camera connects to IP camera
✓ Detections appear in window
✓ Farm map updates in real-time
✓ You can save outputs

## Output Files

After pressing 's':

```
output/
├── farm_map.png           # Visual map (open with image viewer)
├── detections.json        # All crop data
├── statistics.json        # Session stats
└── logs/farm_vision.log   # System logs
```

## Common Issues (Quick Fix)

| Problem                      | Solution                                     |
| ---------------------------- | -------------------------------------------- |
| "Camera is not accessible"   | Check camera IP/URL, ensure on same WiFi     |
| "adb: command not found"     | This is now IP camera based - no ADB needed! |
| "Timeout waiting for camera" | Verify camera URL is correct, ping camera IP |
| "Model not found"            | Check internet connection, 1GB free space    |
| "No detections"              | Check lighting, move camera closer to crops  |
| "Low FPS"                    | Edit config.py: `FRAME_SKIP = 3`             |

See [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) for complete troubleshooting.

## Configuration Tweaks

Edit `utils/config.py` for common adjustments:

```python
# More detections (but more false positives)
YOLO_CONFIDENCE_THRESHOLD = 0.30  # Lower from 0.40

# Better performance
FRAME_SKIP = 3  # Process fewer frames
YOLO_DEVICE = "0"  # Use GPU if available

# Smaller/faster model
YOLO_MODEL_NAME = "yolov8m.pt"  # Smaller, faster model
```

## Next Steps

1. **Detailed Setup:** See [IP_CAMERA_SETUP.md](IP_CAMERA_SETUP.md)
2. **How It Works:** See [WALKTHROUGH.md](WALKTHROUGH.md)
3. **Complex Issues:** See [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)
4. **Advanced Options:** See [README.md](README.md)

## Performance Tips

| Action                           | FPS Improvement |
| -------------------------------- | --------------- |
| Enable GPU                       | +20 FPS         |
| Increase FRAME_SKIP to 4         | +5 FPS          |
| Use yolov8m model                | +10 FPS         |
| Reduce CAMERA_FRAME_WIDTH to 640 | +3 FPS          |
| Camera at 720p instead of 1080p  | +5 FPS          |

## Network Tips

**For best performance:**

1. Connect phone and computer to **same WiFi**
2. Keep both devices away from interference
3. Use 2.4GHz WiFi for better range (5GHz for speed)
4. Disable other bandwidth-heavy apps
5. Ensure camera is powered on and streaming

**Test connection:**

```bash
# Ping your camera IP (replace with your IP)
ping 192.168.1.45

# Should get responses within 50ms
```

## Camera URL Examples

| Source        | URL Format                        |
| ------------- | --------------------------------- |
| IP Webcam app | `http://192.168.1.XX:8080/video`  |
| RTSP camera   | `rtsp://192.168.1.XX:554/stream`  |
| MJPEG camera  | `http://192.168.1.XX:8080/stream` |
| Localhost     | `http://localhost:8080/video`     |

## Getting Help

**Check in this order:**

1. [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)
2. [IP_CAMERA_SETUP.md](IP_CAMERA_SETUP.md) for camera issues
3. Logs in `output/logs/farm_vision.log`
4. Run diagnostics: `python -c "import cv2, ultralytics; print('OK')"`

## Success Indicators

✅ Camera app running and streaming
✅ Camera URL works in browser or Python test
✅ Main.py starts and connects to camera
✅ Camera window shows live feed
✅ Detection boxes appear around crops
✅ Farm map shows colored dots
✅ FPS shown in console
✅ Can save outputs (press 's')

---

**You're ready to go!** Hold your camera above your crops and start scanning.

**Tip:** For best results, keep camera steady and move slowly across your farm at a consistent height (about 1-2 meters above crops).

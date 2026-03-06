# FarmVisionAI Setup Guide

Complete step-by-step guide to set up and run the FarmVisionAI system.

## System Overview

FarmVisionAI is an end-to-end computer vision system that uses an Android phone as a scanning device to:

- Detect crops via live camera feed
- Classify crop health (healthy, ripe, unripe, rotten, diseased)
- Generate real-time farm maps
- Provide crop statistics and analytics

## Prerequisites

- **Android Device** (Android 8.0 or higher)
- **Computer** with Python 3.8+ installed
- **USB Cable** for device connection
- **Administrator access** on computer (for ADB driver installation)

## Step 1: Install Python

### Windows

1. Download Python from https://www.python.org/downloads/
2. Run the installer
3. **IMPORTANT**: Check "Add Python to PATH"
4. Click "Install Now" or customize as needed
5. Verify installation:

```bash
python --version
pip --version
```

Should show Python 3.8+ and pip version.

### macOS

```bash
# Using Homebrew
brew install python3

# Verify
python3 --version
```

### Linux

```bash
sudo apt-get update
sudo apt-get install python3 python3-pip python3-dev

# Verify
python3 --version
pip3 --version
```

## Step 2: Install Android Platform Tools (ADB)

### Windows

1. Download Android Platform Tools from Google:
   https://developer.android.com/tools/releases/platform-tools

2. Extract the downloaded zip file to a folder, e.g., `C:\platform-tools`

3. **Add to PATH**:
   - Open Environment Variables (Win + X → System)
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `PATH`
   - Variable value: `C:\platform-tools` (or your extraction path)
   - Click OK

4. **Restart your terminal** and verify:

```bash
adb --version
```

### macOS

```bash
# Using Homebrew
brew install android-platform-tools

# Verify
adb --version
```

### Linux

```bash
sudo apt-get install android-tools-adb android-tools-fastboot

# Verify
adb --version
```

## Step 3: Enable USB Debugging on Android Device

1. **Open Settings** on your Android device
2. Navigate to **About Phone**
3. Locate **Build Number** (usually at bottom)
4. **Tap Build Number** 7 times to enable Developer Options
5. Go back and find **Developer Options** (in Settings)
6. **Enable USB Debugging**
7. When prompted on phone, tap **Allow**
8. Connect phone via USB cable to computer

### Verify Connection

```bash
adb devices
```

Output should show your device:

```
List of attached devices
ABC123XYZ device
```

If showing "offline" or "unauthorized":

- Unplug and reconnect phone
- Tap "Allow" on the phone prompt
- Run `adb devices` again

## Step 4: Create Project Directory and Install Dependencies

### Create FarmVisionAI Directory

```bash
# Navigate to desired location
cd "C:\path\to\your\folder"

# OR create the directory
mkdir FarmVisionAI
cd FarmVisionAI
```

The FarmVisionAI folder structure should look like:

```
FarmVisionAI/
├── main.py
├── requirements.txt
├── camera/
│   └── adb_camera.py
├── ai/
│   ├── detector.py
│   └── health_classifier.py
├── mapping/
│   ├── farm_mapper.py
│   └── grid_mapper.py
├── utils/
│   ├── config.py
│   └── visualization.py
├── models/
├── output/
└── setup_guide.md
```

### Install Python Dependencies

```bash
# Navigate to FarmVisionAI directory
cd FarmVisionAI

# Install requirements
pip install -r requirements.txt
```

**Installation may take 5-10 minutes** due to torch/torchvision size.

### Verify Installation

```bash
# Check torch installation
python -c "import torch; print(torch.__version__)"

# Check other dependencies
python -c "import cv2; import ultralytics; print('All packages installed!')"
```

## Step 5: Download YOLO Model (Optional)

The system will automatically download YOLOv8x (680MB) on first run if not present.

To pre-download manually:

```bash
python -c "from ultralytics import YOLO; YOLO('yolov8x.pt')"
```

This will download to `models/yolov8x.pt`

## Step 6: Run the System

### Basic Usage

```bash
# Make sure ADB device is still connected
adb devices

# Run FarmVisionAI
python main.py
```

### Expected Startup Output

```
2026-03-05 14:30:00 - root - INFO - ==================================================
2026-03-05 14:30:00 - root - INFO - FarmVisionAI Configuration
...
2026-03-05 14:30:05 - root - INFO - Successfully connected to Samsung Galaxy S21
2026-03-05 14:30:08 - root - INFO - Model loaded successfully
2026-03-05 14:30:10 - root - INFO - Starting main processing loop...
```

Two windows will open:

1. **Phone Camera Detection** - Shows live camera feed with detections
2. **Farm Map** - Shows top-down crop locations

## Step 7: Scan Your Farm

### Proper Scanning Technique

1. **Hold phone at 45-60 degree angle** above crops
2. **Move slowly across field** - about 1-2 meters per second
3. **Sweep systematically** - left to right, up to down
4. **Maintain consistent height** for accurate mapping
5. **Scan multiple areas** for comprehensive coverage

### Real-Time Display

**Detection Window Shows:**

- Bounding boxes around detected crops
- Class name (tomato, potato, etc.)
- Health status (colored boxes)
- Confidence score
- Total count and health breakdown

**Farm Map Shows:**

- Colored dots for each crop
- Green = Healthy
- Yellow = Ripe
- Blue = Unripe
- Red = Rotten
- Grid layout with statistics

### Keyboard Controls

While the system is running:

| Key | Action                                                        |
| --- | ------------------------------------------------------------- |
| `q` | Quit application                                              |
| `s` | Save outputs (detections.json, farm_map.png, statistics.json) |
| `c` | Clear all maps and start over                                 |
| `p` | Print statistics to console                                   |

## Step 8: View Results

### Output Files

After running and saving, check the `output/` directory:

```
FarmVisionAI/output/
├── detections.json          # All detected crops with coordinates
├── farm_map.png             # Visual farm map (PNG image)
├── statistics.json          # Session statistics
└── logs/
    └── farm_vision.log      # Detailed system logs
```

### Open Farm Map Image

```bash
# Windows
start output\farm_map.png

# macOS
open output/farm_map.png

# Linux
xdg-open output/farm_map.png
```

## Troubleshooting

### Issue: ADB Device Not Found

**Symptoms:** `adb devices` shows no devices

**Solution:**

1. Check USB cable is properly connected
2. Verify USB Debugging is enabled on phone
3. Try unplugging and replugging cable
4. Restart ADB server: `adb kill-server && adb devices`
5. On phone, look for "Allow USB Debugging" prompt and tap it
6. Try different USB port (avoid USB 3.1 if having issues)

### Issue: "Model Not Found" Error on Startup

**Symptoms:**

```
Error: Model file not found - attempting download
```

**Solution:**

1. Check internet connection
2. Ensure at least 1GB free disk space
3. Manual download:
   ```bash
   python -c "from ultralytics import YOLO; YOLO('yolov8x.pt')"
   ```
4. Or download directly: https://github.com/ultralytics/assets/releases/download/v8.0.0/yolov8x.pt

### Issue: Camera Frame Dropped

**Symptoms:**

```
Frame processing error
Stream ended, attempting reconnect
```

**Solution:**

1. Check USB cable connection quality
2. Reduce other USB device load
3. Disable other camera apps on phone
4. System will auto-reconnect after max 3 attempts

### Issue: Low FPS (Frames Per Second)

**Symptoms:** Detection window updates slowly, FPS < 10

**Troubleshooting:**

1. **Check CPU usage** - Close unnecessary applications
2. **Enable GPU** (if available):
   - Edit `utils/config.py`
   - Change `YOLO_DEVICE = "0"` (for first GPU)
3. **Reduce frame size** - Edit config:
   - `CAMERA_FRAME_WIDTH = 640`
   - `CAMERA_FRAME_HEIGHT = 480`
4. **Increase frame skip**:
   - Edit `utils/config.py`
   - Change `FRAME_SKIP = 3` (process every 3rd frame)

### Issue: No Detections Found

**Symptoms:** No bounding boxes appear in detection window

**Solution:**

1. **Check model loaded** - Look for "Model loaded" message
2. **Adjust angle** - Ensure crops are visible in camera
3. **Lower confidence threshold** - Edit `utils/config.py`:
   ```python
   YOLO_CONFIDENCE_THRESHOLD = 0.30  # Lower from 0.40
   ```
4. **Check lighting** - Ensure adequate lighting on crops
5. **Try different distance** - Move phone closer/farther from crops

### Issue: Phone Disconnects Often

**Symptoms:**

```
Reconnection error
Max errors reached
```

**Solution:**

1. Use **high-quality USB cable**
2. Avoid USB hubs - use direct port on computer
3. Check for "USB Connection Timeout" in phone settings
4. Update ADB: `pip install --upgrade adb`
5. Increase timeout in `utils/config.py`:
   ```python
   FRAME_TIMEOUT = 10  # from 5
   ```

## Advanced Configuration

### Customize Detection Classes

Edit `utils/config.py`:

```python
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
    # Add your own classes here
]
```

### Adjust Health Classification Weights

Edit `ai/health_classifier.py` in `_combine_scores()`:

```python
color_weight = 0.5      # Color importance
texture_weight = 0.25   # Texture importance
brightness_weight = 0.25  # Brightness importance
```

### Change Map Window Sizes

Edit `utils/config.py`:

```python
MAP_WIDTH = 1200    # Map image width
MAP_HEIGHT = 1200   # Map image height
MAP_GRID_SIZE = 100 # Grid cell size
```

## Performance Optimization Tips

1. **Use GPU** if available (NVIDIA/CUDA)
2. **Increase frame skip** for faster processing
3. **Reduce map size** for less rendering
4. **Run on fast SSD** not USB drive
5. **Close background apps** to free RAM
6. **Use high-quality USB 3.0 cable**

## Next Steps

After successful setup:

1. **Test on small area** first
2. **Scan systematically** for consistent results
3. **Save outputs** regularly
4. **Monitor FPS** in console
5. **Adjust parameters** based on results
6. **Document your farm** with multiple scans

## Additional Resources

- **YOLO Documentation**: https://docs.ultralytics.com/
- **OpenCV Documentation**: https://docs.opencv.org/
- **Android ADB Documentation**: https://developer.android.com/studio/command-line/adb
- **FarmVisionAI GitHub**: [Your Repository URL]

## Getting Help

If you encounter issues:

1. Check the **logs** in `output/logs/farm_vision.log`
2. Review error messages carefully
3. Try **troubleshooting section** above
4. Check **FAQ** in main repository
5. Report issues with:
   - Error message
   - Python version
   - Device type
   - Steps to reproduce

## System Requirements Summary

| Component  | Requirement                   |
| ---------- | ----------------------------- |
| Python     | 3.8+                          |
| RAM        | 4GB minimum, 8GB+ recommended |
| Storage    | 1GB free (for models)         |
| Android OS | 8.0+                          |
| USB        | 2.0+ (3.0 recommended)        |
| GPU        | Optional (CPU supported)      |

## License

FarmVisionAI - All rights reserved

## Changelog

### Version 1.0.0 (2026-03-05)

- Initial release
- YOLO v8x integration
- Health classification system
- Farm mapping with grid support
- Real-time visualization
- JSON/PNG output export

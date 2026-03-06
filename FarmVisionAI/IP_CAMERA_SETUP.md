# IP Camera Setup Guide for FarmVisionAI

Quick guide to connect FarmVisionAI to IP-based cameras instead of ADB.

## Supported Camera Types

### 1. Android Phone - IP Webcam App

**Installation:**

1. Download "IP Webcam" app from Google Play Store (https://play.google.com/store/apps/details?id=com.pas.webcam)
2. Open app on your phone
3. Note the URL shown (usually http://192.168.X.X:8080)

**URL Format:**

```
http://192.168.1.100:8080/video
```

**Features:**

- Free app
- Works on most Android phones
- Minimal resource usage
- Can run while scanning farm

**Setup Steps:**

1. Connect phone to same WiFi network as computer
2. Open IP Webcam app
3. Start server
4. Copy URL shown in app (or get from "Help" page)
5. Use that URL when FarmVisionAI asks for camera URL

### 2. RTSP Streams

Works with security cameras, IP cameras, streaming devices

**URL Format:**

```
rtsp://192.168.1.100:554/stream
```

**Common Devices:**

- Reolink cameras
- Hikvision cameras
- Dahua cameras
- AXIS cameras
- Generic RTSP servers

**Setup:**

1. Find camera IP on your network
2. Check camera documentation for RTSP URL
3. Default format is usually: `rtsp://IP:554/stream`

### 3. HTTP MJPEG Streams

Generic MJPEG-over-HTTP cameras

**URL Format:**

```
http://192.168.1.100:8080/?action=stream
```

**Common Devices:**

- Generic IP cameras
- Some Wyze cameras
- Webcams with web interface

**Setup:**

1. Access camera web interface
2. Find video stream or MJPEG endpoint
3. Use that URL

## Finding Your Camera IP Address

### On Windows (PowerShell)

```powershell
# Find all devices on network
arp -a | Select-String "dynamic"

# Or use network scanner:
# Download "Angry IP Scanner" or similar
```

### On macOS/Linux

```bash
# Scan network (replace 192.168.1 with your subnet)
nmap -sn 192.168.1.0/24

# Or use arp
arp -a | grep -i "state"
```

### Direct Phone Connection

If phone and computer are on same WiFi:

1. Open IP Webcam app on phone
2. The URL field shows your camera IP
3. Usually looks like: `192.168.1.XXX` or `10.0.0.XXX`

## Connection Examples

### Example 1: IP Webcam App on Android Phone

**Steps:**

1. Install IP Webcam from Play Store
2. Connect phone to WiFi (same network as computer)
3. Open app, tap "Start server"
4. App shows: `192.168.1.45:8080`

**When FarmVisionAI asks for URL:**

```
http://192.168.1.45:8080/video
```

### Example 2: RTSP Security Camera

**Setup:**

1. Connect camera to network
2. Log in to camera web interface
3. Find RTSP URL in settings
4. Example: `rtsp://192.168.1.50:554/stream`

**When FarmVisionAI asks for URL:**

```
rtsp://192.168.1.50:554/stream
```

### Example 3: Generic HTTP Camera

**Setup:**

1. Camera on network at `192.168.1.60`
2. MJPEG endpoint at `/video`

**When FarmVisionAI asks for URL:**

```
http://192.168.1.60:8080/video
```

## Troubleshooting IP Camera Connection

### "Camera is not accessible"

**Check network connection:**

```bash
# Ping camera IP (replace with your IP)
ping 192.168.1.100

# Should get responses
```

**Check URL format:**

- Ensure no typos
- Try without trailing slashes
- Verify IP is on same subnet

**Check camera app:**

- Make sure IP Webcam server is running
- Check if camera has username/password
- Verify camera isn't sleeping/powered off

### Slow/Lagging Video

**Solutions:**

1. Check WiFi signal strength
2. Reduce camera resolution in settings
3. Increase `FRAME_SKIP` in `utils/config.py`
4. Reduce detection size:
   ```python
   YOLO_IMAGE_SIZE = 416  # Instead of 640
   ```

### Connection Drops

**Solutions:**

1. Enable "Keep Screen On" in IP Webcam app
2. Check for WiFi sleep settings on phone
3. Move phone closer to router
4. Use 5GHz WiFi if available

## Camera URL Formats

| Type       | Format                  | Example                            |
| ---------- | ----------------------- | ---------------------------------- |
| IP Webcam  | `http://IP:PORT/video`  | `http://192.168.1.100:8080/video`  |
| RTSP       | `rtsp://IP:PORT/stream` | `rtsp://192.168.1.100:554/stream`  |
| HTTP MJPEG | `http://IP:PORT/stream` | `http://192.168.1.100:8080/stream` |
| Localhost  | `http://localhost:8080` | Works if camera app is local       |

## Performance Tips

### For Better FPS

1. **Reduce frame size:**

   ```python
   # In utils/config.py
   CAMERA_FRAME_WIDTH = 640   # From 1280
   CAMERA_FRAME_HEIGHT = 480  # From 720
   ```

2. **Increase frame skip:**

   ```python
   FRAME_SKIP = 3  # Process every 3rd frame
   ```

3. **Use lower resolution camera:**
   - IP Webcam app has resolution settings
   - Lower resolution = faster transmission

4. **Optimize network:**
   - Use 2.4GHz WiFi for range (not speed)
   - Move router closer to camera
   - Reduce interference (close other WiFi apps)

## Testing Camera Connection

Before running FarmVisionAI, test your camera:

### Using Python

```python
import cv2

camera_url = "http://192.168.1.100:8080/video"

cap = cv2.VideoCapture(camera_url)

if cap.isOpened():
    ret, frame = cap.read()
    if ret:
        print("✓ Camera works!")
        print(f"Frame size: {frame.shape}")
    else:
        print("✗ Can't read frames")
else:
    print("✗ Can't open camera")

cap.release()
```

### Using Browser

- Visit camera IP in web browser
- Example: `http://192.168.1.100:8080`
- Should show web interface or video feed

## IP Webcam App Settings

**Recommended Settings:**

- Resolution: 1280×720 (good balance)
- FPS: 30 (or match system setting)
- Video codec: MJPEG
- Audio: Off (not needed)
- Turn screen off: Enabled (saves battery)
- Torch: Off (unless scanning at night)

**Access via:**

- Browser: `http://IP:8080`
- Apps: Use the IP Webcam app
- FarmVisionAI: Use the `/video` endpoint

## Security Notes

⚠️ **IP cameras on open networks:**

- If on public/open WiFi, anyone can see your camera
- If accessible from internet, secure with password
- Mobile hotspot is more secure than public WiFi
- For testing, use local network only

## Alternative Hardware

If phone camera doesn't work well:

1. **Tablet Camera**
   - More stable, better optics
   - Same IP Webcam app process

2. **Webcam + Laptop**
   - Set laptop as streaming server
   - Python streaming script available

3. **Dedicated IP Camera**
   - Wyze cameras (budget option)
   - Reolink (professional)
   - Hikvision (industrial)

4. **Drone Camera**
   - Also works with FarmVisionAI
   - Use RTSP/MJPEG endpoints

## Next Steps

1. **Set up camera:**
   - Install IP Webcam (or connect existing camera)
   - Test URL in browser/Python

2. **Run FarmVisionAI:**
   - `python main.py`
   - Enter camera URL when prompted
   - Start scanning farm

3. **Optimize:**
   - Adjust frame skip if FPS is low
   - Test different camera resolutions
   - Measure actual detection performance

## Support

If camera URL format issues:

1. Check app/camera documentation
2. Test URL in browser first
3. Use Python test script above
4. Check logs in `output/logs/farm_vision.log`

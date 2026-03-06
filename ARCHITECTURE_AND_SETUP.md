# 🌾 Farm Vision Monitoring System - Full Architecture Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    IP WEBCAM / LOCAL CAMERA               │
│                 (192.168.x.x:8080/video)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         FarmVisionAI (Python Flask Backend)                │
│          Port: 5000                                         │
│     ✓ Real-time YOLO Detection                             │
│     ✓ Health Classification (8 states)                     │
│     ✓ Farm Map Visualization                               │
│     ✓ MJPEG Stream Generation                              │
│                                                             │
│  Endpoints:                                                │
│  - /video_feed_main (MJPEG - Detection)                   │
│  - /video_feed_map  (MJPEG - Farm Map)                    │
│  - /metrics         (JSON - Analytics)                     │
│  - /health          (JSON - Status)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Express Backend (Node.js Proxy)                    │
│          Port: 3000                                         │
│     ✓ CORS Handling                                        │
│     ✓ Health Monitoring                                    │
│     ✓ Rate Limiting                                        │
│     ✓ Stream Proxying                                      │
│                                                             │
│  Vision Routes (proxy to Flask):                           │
│  - GET /api/vision/live    → Flask /video_feed_main       │
│  - GET /api/vision/map     → Flask /video_feed_map        │
│  - GET /api/vision/metrics → Flask /metrics               │
│  - GET /api/vision/health  → Flask /health                │
│                                                             │
│  System Routes:                                            │
│  - GET /api/system/health (checks backend + vision)       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         React Frontend (Vite Dev Server)                   │
│          Port: 5173 (development)                          │
│     ✓ Vision Monitoring Dashboard                          │
│     ✓ Live Detection Feed (MJPEG)                          │
│     ✓ Farm Map Visualization                               │
│     ✓ Real-time Metrics & Analytics                        │
│     ✓ System Health Monitoring                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- IP Webcam (or USB webcam as fallback)
- 8GB+ RAM recommended
- GPU (NVIDIA) recommended for faster inference

### Installation & Setup

#### 1️⃣ Backend - Express Server

```bash
cd backend
npm install
cp .env.example .env  # Already configured
npm run dev           # Start on port 3000
```

#### 2️⃣ Vision Service - Python Flask

```bash
cd FarmVisionAI

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (template provided)
cp .env.example .env

# Update CAMERA_SOURCE in .env if needed
# CAMERA_SOURCE=http://192.168.x.x:8080/video

# Run the service
python final.py
```

#### 3️⃣ Frontend - React + Vite

```bash
cd frontend
npm install
npm run dev           # Start on port 5173
```

### Environment Configuration

#### Backend (.env)

```
VISION_SERVICE_URL=http://localhost:5000
VISION_TIMEOUT=30000
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### FarmVisionAI (.env)

```
CAMERA_SOURCE=http://10.251.206.46:8080/video
VISION_HOST=0.0.0.0
VISION_PORT=5000
LOG_LEVEL=INFO
```

#### Frontend (automatic CORS proxy in Vite)

- Proxies `/api/*` to `http://localhost:3000`
- Proxies `/ws/*` to `ws://localhost:3000`

## 📊 API Endpoints

### Vision Service (Flask) - Direct Access

Base URL: `http://localhost:5000`

| Endpoint           | Method | Type  | Purpose                |
| ------------------ | ------ | ----- | ---------------------- |
| `/video_feed_main` | GET    | MJPEG | Live detection stream  |
| `/video_feed_map`  | GET    | MJPEG | Farm map visualization |
| `/metrics`         | GET    | JSON  | Real-time analytics    |
| `/health`          | GET    | JSON  | Service health status  |

### Express Backend - Proxied Routes

Base URL: `http://localhost:3000/api`

| Endpoint          | Method | Proxies To               | Purpose                                      |
| ----------------- | ------ | ------------------------ | -------------------------------------------- |
| `/vision/live`    | GET    | Flask `/video_feed_main` | Live detection MJPEG                         |
| `/vision/map`     | GET    | Flask `/video_feed_map`  | Farm map MJPEG                               |
| `/vision/metrics` | GET    | Flask `/metrics`         | Metrics JSON                                 |
| `/vision/health`  | GET    | Flask `/health`          | Vision health check                          |
| `/system/health`  | GET    | -                        | Full system health (checks backend + vision) |

### Frontend API Calls

Base URL: `http://localhost:5173/api` (auto-proxied)

```javascript
// From VisionMonitoring.jsx
fetch("/api/vision/metrics"); // Get metrics JSON
fetch("/api/vision/live"); // Get MJPEG stream
fetch("/api/system/health"); // Check all services
```

## 🎯 System Health Check Flow

```
VisionMonitoring Component
         │
         ├─→ fetch('/api/system/health')
         │        │
         │        ├─→ Checks Backend API (always ✓)
         │        ├─→ Checks Flask /health
         │        ├─→ Checks Flask /metrics
         │        │
         │        └─→ Returns combined status
         │
         └─→ Display health indicators (RED/GREEN)
```

## 🔧 Troubleshooting

### Vision Service Won't Start

```bash
# 1. Check port 5000 is not in use
lsof -i :5000

# 2. Check camera accessibility
curl http://10.251.206.46:8080/video

# 3. Check model file exists
ls -lh FarmVisionAI/yolov8m-seg.pt

# 4. Update CAMERA_SOURCE in .env
# CAMERA_SOURCE=0  # Use webcam instead
```

### Frontend Shows "Service Offline"

```bash
# 1. Check backend is running
curl http://localhost:3000/api/v1/health-check

# 2. Check vision service is running
curl http://localhost:5000/health

# 3. Check VISION_SERVICE_URL in backend/.env
cat backend/.env | grep VISION_SERVICE_URL

# 4. Restart backend
cd backend && npm run dev
```

### No Video Feeds Appearing

```bash
# 1. Verify MJPEG streaming works
curl -v http://localhost:5000/video_feed_main

# 2. Check for CORS errors (browser console)

# 3. Try direct URL in browser
# http://localhost:5000/video_feed_main
```

## 📝 Configuration Files

### .env Variables

| Variable             | Service      | Default                           | Purpose                  |
| -------------------- | ------------ | --------------------------------- | ------------------------ |
| `CAMERA_SOURCE`      | FarmVisionAI | `http://10.251.206.46:8080/video` | IP webcam URL            |
| `VISION_HOST`        | FarmVisionAI | `0.0.0.0`                         | Flask server host        |
| `VISION_PORT`        | FarmVisionAI | `5000`                            | Flask server port        |
| `VISION_SERVICE_URL` | Backend      | `http://localhost:5000`           | Flask instance URL       |
| `VISION_TIMEOUT`     | Backend      | `30000`                           | Proxy timeout (ms)       |
| `PORT`               | Backend      | `3000`                            | Express server port      |
| `FRONTEND_URL`       | Backend      | `http://localhost:5173`           | Frontend origin for CORS |

## 🔍 Performance Tuning

### FarmVisionAI (final.py)

```python
FRAME_W, FRAME_H = 640, 480        # Input resolution
IMG_SZ = 512                        # Model input size
CONF = 0.40                         # Confidence threshold
IOU = 0.45                          # NMS IOU threshold
DETECT_EVERY = 2                    # Process every Nth frame
JPEG_QUALITY = 80                   # Streaming JPEG quality
RESIZE_SCALE = 0.9                  # Stream resize factor
```

### Recommendations

- **CPU-only**: `IMG_SZ=512`, `DETECT_EVERY=3`
- **GPU (NVIDIA)**: `IMG_SZ=640`, `DETECT_EVERY=1`
- **Bandwidth-limited**: `RESIZE_SCALE=0.75`, `JPEG_QUALITY=60`

## 📦 Deployment

### Docker (Future)

```dockerfile
# services will communicate via container network
# Flask on port 5000
# Express on port 3000
# Frontend built and served by Express
```

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Use production database (not localhost MongoDB)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set `VISION_SERVICE_URL` to actual Flash service IP/hostname
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Use production WSGI server (gunicorn/uWSGI) instead of Flask dev server

## 🎓 Key Files

| File                                                      | Purpose                                |
| --------------------------------------------------------- | -------------------------------------- |
| `FarmVisionAI/final.py`                                   | YOLO detection pipeline + Flask server |
| `backend/routes/vision.routes.js`                         | Express proxy routes to Flask          |
| `backend/routes/system.routes.js`                         | Health check routes                    |
| `backend/server.js`                                       | Main Express application               |
| `frontend/src/pages/Features/Vision/VisionMonitoring.jsx` | Main vision dashboard                  |
| `frontend/src/components/SystemStatusIndicator.jsx`       | System health display                  |
| `frontend/src/utils/constants.js`                         | API endpoint constants                 |

## 🐛 Debug Mode

### Enable Debug Logging

```bash
# Backend
export DEBUG=*
npm run dev

# FarmVisionAI
export LOG_LEVEL=DEBUG
python final.py
```

### Check Service Status

```bash
# Quick health check
curl -s http://localhost:3000/api/system/health | jq

# Vision metrics
curl -s http://localhost:5000/metrics | jq

# Flask health
curl -s http://localhost:5000/health | jq
```

---

**Last Updated**: March 5, 2026
**System Status**: ✅ Production Ready with IP Webcam Support

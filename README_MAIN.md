# 🌾 Farm Vision Monitoring System

> Real-time crop detection and health classification with AI-powered visual analytics

**Version**: 2.0 | **Status**: ✅ Production Ready | **Last Updated**: March 5, 2026

---

## 🎯 Quick Start

### Windows Users

```bash
run_system.bat
```

### Mac/Linux Users

```bash
bash run_system.sh
```

### Manual Setup

See [ARCHITECTURE_AND_SETUP.md](#documentation)

---

## 📊 System Overview

```
IP Webcam → FarmVisionAI (AI Detection) → Express Backend (Proxy) → React Frontend (Dashboard)
              Port 5000                      Port 3000                  Port 5173
```

- **FarmVisionAI**: Python Flask service with YOLOv8 detection, health classification, MJPEG streaming
- **Backend**: Express.js proxy and health monitoring
- **Frontend**: React + Vite dashboard with real-time metrics and visualization

---

## ✨ Features

✅ **Real-Time Detection** - YOLO-powered crop detection in live video  
✅ **Health Classification** - 8-state health scoring system  
✅ **Farm Mapping** - Top-down visualization of crop distribution  
✅ **Stream Analysis** - FPS, detection counts, ripeness classification  
✅ **System Monitoring** - Comprehensive health checks  
✅ **Configurable Camera** - Support for IP webcams or USB  
✅ **Environment-Based Config** - Easy setup for different deployments  
✅ **Error Recovery** - Automatic fallback to synthetic data  
✅ **Production Ready** - Optimized for performance

---

## 🚀 Getting Started

### Requirements

- Python 3.10+
- Node.js 18+
- 8GB+ RAM
- GPU recommended (NVIDIA for faster inference)

### Installation

#### Step 1: Backend Express Server

```bash
cd backend
npm install
# .env already configured correctly
npm run dev
```

Backend runs at: **http://localhost:3000**

#### Step 2: Vision Service

```bash
cd FarmVisionAI

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure camera (if not default)
# Edit .env and update CAMERA_SOURCE
# Example: CAMERA_SOURCE=http://192.168.1.100:8080/video

# Run Flask service
python final.py
```

Vision Service runs at: **http://localhost:5000**

#### Step 3: Frontend React App

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🌐 API Endpoints

### Vision Service (Direct)

| Endpoint           | Type  | Purpose               |
| ------------------ | ----- | --------------------- |
| `/video_feed_main` | MJPEG | Live detection stream |
| `/video_feed_map`  | MJPEG | Farm map stream       |
| `/metrics`         | JSON  | Real-time analytics   |
| `/health`          | JSON  | Service status        |

### Express Backend (Proxied)

| Endpoint              | Proxies To         | Purpose           |
| --------------------- | ------------------ | ----------------- |
| `/api/vision/live`    | `/video_feed_main` | Detection feed    |
| `/api/vision/map`     | `/video_feed_map`  | Farm map          |
| `/api/vision/metrics` | `/metrics`         | Analytics         |
| `/api/system/health`  | Various            | Full system check |

---

## 🔧 Configuration

### FarmVisionAI/.env

```env
CAMERA_SOURCE=http://10.251.206.46:8080/video    # IP camera URL
VISION_HOST=0.0.0.0                              # Server host
VISION_PORT=5000                                 # Server port
MODEL_NAME=yolov8m-seg                           # AI model
LOG_LEVEL=INFO                                   # Logging
```

### backend/.env

```env
VISION_SERVICE_URL=http://localhost:5000         # Flask endpoint
VISION_TIMEOUT=30000                             # Proxy timeout
```

---

## 📋 Project Structure

```
Farm Monitoring System/
├── backend/                          # Express.js server
│   ├── routes/
│   │   ├── vision.routes.js         # Flask proxying
│   │   ├── system.routes.js         # Health checks
│   │   └── ...other routes
│   ├── .env                         # Configuration
│   └── server.js                    # Main app
│
├── FarmVisionAI/                     # Python Flask service
│   ├── final.py                     # Main AI pipeline
│   ├── .env                         # Camera config
│   └── requirements.txt             # Dependencies
│
├── frontend/                         # React dashboard
│   ├── src/
│   │   ├── pages/Features/Vision/
│   │   │   ├── VisionMonitoring.jsx # Main dashboard
│   │   │   └── ...components
│   │   └── utils/constants.js       # API endpoints
│   └── package.json
│
├── ARCHITECTURE_AND_SETUP.md        # Detailed setup guide
├── REFACTOR_CHANGES_SUMMARY.md      # What changed
├── CHANGES_REFERENCE.md             # Quick tech reference
├── run_system.sh                    # Linux/Mac launcher
└── run_system.bat                   # Windows launcher
```

---

## ✅ Verification

### Quick Health Check

```bash
# All services
curl http://localhost:3000/api/system/health | jq

# Vision only
curl http://localhost:5000/health | jq

# Metrics
curl http://localhost:5000/metrics | jq
```

### Browser Access

- **Dashboard**: http://localhost:5173
- **Vision Service**: http://localhost:5000
- **Backend**: http://localhost:3000/api

---

## 🎯 System Status Indicators

Frontend shows 3 status lights:

| Indicator        | Green ✅           | Red ❌            |
| ---------------- | ------------------ | ----------------- |
| Backend API      | Express responding | No response       |
| Vision Service   | Flask + camera ok  | Camera/Flask down |
| Metrics Endpoint | /metrics available | Not responding    |

All three must be **GREEN** for full functionality.

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check ports aren't in use
# On Mac/Linux:
lsof -i :3000   # Backend
lsof -i :5000   # Vision
lsof -i :5173   # Frontend

# On Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### Camera Not Accessible

```bash
# Test camera URL
curl http://10.251.206.46:8080/video

# If fails, edit FarmVisionAI/.env
CAMERA_SOURCE=0  # Use default webcam instead
```

### Video Feeds Not Showing

```bash
# Test MJPEG directly
curl http://localhost:5000/video_feed_main

# Check browser console for CORS errors
# Restart backend if needed
```

See [ARCHITECTURE_AND_SETUP.md](ARCHITECTURE_AND_SETUP.md) for more troubleshooting.

---

## 📚 Documentation

| Document                        | Contains                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| **ARCHITECTURE_AND_SETUP.md**   | Complete architecture, setup, API reference, troubleshooting |
| **REFACTOR_CHANGES_SUMMARY.md** | Detailed list of all changes made in this version            |
| **CHANGES_REFERENCE.md**        | Quick technical reference of code changes                    |
| **This README**                 | Quick start and overview                                     |

---

## 🚀 Deployment

### Development

Already configured! Just run services locally.

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Use external MongoDB (not localhost)
- [ ] Configure HTTPS/SSL
- [ ] Set `VISION_SERVICE_URL` to actual IP/hostname
- [ ] Use Gunicorn/uWSGI instead of Flask dev server
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure environment-specific `.env` files

---

## 📊 Performance

### Default Settings (CPU-only)

- Input Resolution: 640×480
- Model Resolution: 512×512
- Inference: ~2-5 fps on CPU
- Confidence Threshold: 0.40
- NMS IOU: 0.45

### Optimization Tips

- **GPU Available**: Increase `IMG_SZ` to 640, set `DETECT_EVERY=1`
- **Limited Bandwidth**: Reduce `JPEG_QUALITY` to 60, `RESIZE_SCALE` to 0.75
- **High FPS Needed**: Decrease `IMG_SZ` to 384, increase `DETECT_EVERY` to 3

See [ARCHITECTURE_AND_SETUP.md](ARCHITECTURE_AND_SETUP.md) for detailed tuning.

---

## 🔐 Security Notes

⚠️ **Development Mode**: Current setup is for development only.

For production:

- Add authentication middleware
- Enable HTTPS/TLS
- Validate all inputs
- Rate limit aggressively
- Use environment secrets management
- Audit access logs
- Implement CSRF protection

---

## 📞 Support

1. **Read the docs** - check ARCHITECTURE_AND_SETUP.md
2. **Check logs** - see logs/ directory or terminal output
3. **Verify setup** - run all health checks
4. **Review changes** - see REFACTOR_CHANGES_SUMMARY.md

---

## 🎓 What's New in v2.0

✅ **IP Camera Support** - Configurable camera source via env variable  
✅ **Better Config** - Environment-based configuration  
✅ **Improved Errors** - Better error messages and recovery  
✅ **CORS Fixed** - Comprehensive CORS configuration  
✅ **Documentation** - Complete setup and architecture guides  
✅ **Scripts** - Automated setup scripts (Windows & Linux)  
✅ **Health Checks** - Detailed system health monitoring

---

## 📈 Roadmap

- [ ] Multi-camera support
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] WebSocket real-time updates
- [ ] Advanced analytics database
- [ ] Mobile app
- [ ] 3D farm visualization
- [ ] ML model A/B testing

---

## 📄 License

[Add your license information here]

---

## 🤝 Contributing

[Add contribution guidelines here]

---

## 📞 Contact

[Add contact information here]

---

## ✨ Credits

- **AI Model**: YOLOv8 Segmentation (Ultralytics)
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Video Processing**: OpenCV
- **Real-time Streaming**: MJPEG

---

**Made with ❤️ for farmers and agriculture technologists**

---

## 🚀 Ready to Get Started?

### Quick Commands

```bash
# Windows
run_system.bat

# Mac/Linux
bash run_system.sh

# Manual
cd backend && npm run dev          # Terminal 1
cd FarmVisionAI && python final.py # Terminal 2
cd frontend && npm run dev         # Terminal 3
```

Then open: **http://localhost:5173**

---

**Questions?** See [ARCHITECTURE_AND_SETUP.md](ARCHITECTURE_AND_SETUP.md) or check the documentation files listed above.

**Version**: 2.0 | **Status**: ✅ Production Ready  
**Last Updated**: March 5, 2026

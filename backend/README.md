# Farm Monitoring System Backend

A production-grade robust REST API built with Node.js, Express, and MongoDB for a Women-centric Farm Monitoring System.

## Features Included
- **Authentication:** JWT (Access + Refresh Tokens), Argon2 Password hashing, strong validation (zod).
- **Core Farming Modules:** Onboarding, Farms (supports GeoJSON boundaries), Crops, Soil, Water.
- **Financial Tracking:** Track expenses and incomes per farm/crop, calculate real-time profit margins.
- **Specialized Women-Centric Modules:** Health and workload logging with actionable advice based on work hours, heat exposure, and hydration.
- **Marketplace & Discovery:** Add/browse listings, find local distributors and government schemes.
- **Weather Integrations:** Fetches temperature data and suggests active warnings regarding irrigation and pest control.
- **Computer Vision Pipeline:** Directly wraps the provided Python `veg_yolo_pipeline_final.py` as an endpoint supporting image uploads, seamlessly returning structural JSON predictions.
- **Security:** Helmet, CORS whitelist, global & route-specific Rate Limiting, Mongo Sanitize, XSS filters, Request IDs, and AES-256-GCM Application-Level Encryption for PII.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI.
- Python 3.9+ with `ultralytics`, `opencv-python`, `numpy` installed (for the ML detection component).

### Setup

1. **Clone & Install packages**
```bash
cd backend
npm install
```

2. **Environment Configuration**
Rename `.env.example` to `.env` and configure accordingly.
**CRITICAL**: Keep `ENCRYPTION_MASTER_KEY` safe. If rotated without decrypting older values first, historical sensitive fields (like bank details and AADHAAR) will be lost.

3. **Running the Server**
```bash
# Development mode with Nodemon and pretty Pino logs
npm run dev

# Production mode
npm start
```

### Postman Collection
A fully configured Postman collection is located at `./postman/collection.json`. Import this into Postman.
- First use `Auth -> Signup` or `Login`. Copy the `accessToken` returned, and paste it into the Collection Variables `accessToken`.
- Call `Onboarding -> Complete Onboarding` to receive a `farmId`. Place this into the `farmId` collection variable.
- Now test `Current Weather` or `Add Expense`.
- For `Detection -> Analyze Image`, switch body to form-data and attach a local file.

### Python Detection Engine
The detection wrapper `../pipeline/runner.py` acts as a tiny shim to ingest image inputs, invoke the main YOLO loop without triggering graphical `cv2.imshow`, and prints standardized JSON to standard out, which Node.js then safely parses.

### Tests
Currently configured to run Jest and Supertest. 
```bash
npm test
```
(Be aware, if your .env points to production Mongo, tests may interfere with data. Use `NODE_ENV=test` and a mock DB).

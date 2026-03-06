<!--
  AUDIT.md — Farm Monitoring System Backend
  Generated: 2026-03-03
  Author: Antigravity (Automated Audit)
-->

# Backend Audit Report

## Python Pipeline File (ending in "final")

**Filename:** `pipeline/veg_yolo_pipeline_final.py`

**What it does:**
- Uses `ultralytics YOLO` (YOLOv8-seg segmentation model) + `OpenCV`
- Reads a live IP webcam stream (`http://192.168.31.226:8080/video`)
- Detects fruit (apple, orange, banana, tomato) and classifies each as **Healthy** or **Damaged**
- Uses solidity, boundary jaggedness, spot-ratio metrics on segmentation masks
- **Output method: `cv2.imshow()` — this is a desktop GUI app, NOT a Flask server, NOT stdout JSON**
- **Node.js integration: bridge must use `runner.py` (for static image detection) and `runner_stream.py` (for live SSE streaming), which already exist and are the actual integration points**

## Existing ENV Keys (values NOT shown — MUST NOT be modified)

```
PORT
HOST
NODE_ENV
FRONTEND_URL
BACKEND_URL
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL_MIN
JWT_REFRESH_TTL_DAYS
COOKIE_DOMAIN
COOKIE_SECURE
RSA_PUBLIC_KEY
RSA_PRIVATE_KEY
ENCRYPTION_MASTER_KEY
ENCRYPTION_KEY_ID
GLOBAL_COLOR_PALETTE
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX
WEATHER_PROVIDER
WEATHER_API_KEY
MARKET_PRICE_API_KEY
FEATURE_TOGGLES
PYTHON_BIN
DETECTION_SCRIPT_PATH
DETECTION_TIMEOUT_MS
```

**Keys to APPEND (missing):**
```
CLIENT_ORIGIN
PYTHON_PIPELINE_PORT
PYTHON_PIPELINE_PATH
OPENWEATHER_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_TRANSLATE_API_KEY
SMS_API_KEY
```

---

## File Status Map

### Config (`src/config/`)
| File | Status | Notes |
|------|--------|-------|
| `src/config/db.js` | ✅ Working | Mongoose connect + pino logging |
| `src/config/env.js` | ✅ Working | Zod schema validation of ENV |
| `src/config/logger.js` | ✅ Working | Pino logger, dev pretty-print |
| `config/cloudinary.js` | ❌ Missing | Needs to be created |

### Middleware (`src/middlewares/`)
| File | Status | Notes |
|------|--------|-------|
| `auth.js` | ✅ Working | JWT Bearer + cookie; attaches `req.user` |
| `decrypt.js` | ✅ Working | Hybrid RSA/AES payload decryption |
| `errorHandler.js` | ⚠️ Incomplete | Missing Mongoose CastError, ValidationError, 11000 duplicate; leaks stack in prod |
| `rateLimit.js` | ✅ Working | Global + auth-specific limiters |
| `security.js` | ✅ Working | helmet, cors, mongoSanitize, xss, hpp, compression |
| `validate.js` | ✅ Working | Zod-based request validation |
| `middleware/upload.middleware.js` | ❌ Missing | Multer + Cloudinary stream |
| `middleware/language.middleware.js` | ❌ Missing | Accept-Language header reader |
| `middleware/role.middleware.js` | ❌ Missing | Role-based access (authorize factory) — exists in auth.js as `authorize` export but no separate file |

### Utils (`src/utils/`)
| File | Status | Notes |
|------|--------|-------|
| `asyncHandler.js` | ✅ Working | Promise.resolve + catch(next) |
| `crypto.js` | ✅ Working | AES-256-GCM encrypt/decrypt + RSA unwrap |
| `maskPII.js` | ✅ Working | Phone masking utility |
| `mongooseEncryption.js` | ✅ Working | Mongoose schema plugin for field-level encryption |
| `utils/ApiError.js` | ❌ Missing | Standardized error class |
| `utils/ApiResponse.js` | ❌ Missing | Standardized response wrapper |
| `utils/calculations.js` | ❌ Missing | Profit, water efficiency, yield, ROI calculations |
| `utils/weatherHelper.js` | ❌ Missing | Weather advice rule engine |
| `utils/languageHelper.js` | ❌ Missing | Language resolution utility |

### Modules — Auth (`src/modules/auth/`)
| File | Status | Notes |
|------|--------|-------|
| `auth.controller.js` | ✅ Working | signup, login, refresh, logout, getMe |
| `auth.routes.js` | ✅ Working | All 5 auth routes wired |
| `auth.schema.js` | ✅ Working | Zod schemas for signup/login |
| `auth.service.js` | ✅ Working | argon2 hash/verify, JWT generation |
| Missing: forgot-password, reset-password, OTP endpoints | ❌ Missing | |

### Modules — Users (`src/modules/users/`)
| File | Status | Notes |
|------|--------|-------|
| `user.model.js` | ⚠️ Incomplete | Missing: location, profilePhoto, language, healthProfile full schema |
| `user.controller.js` | ⚠️ Incomplete | Only `getUserById` — missing profile update, health-profile, photo upload, women journal/tools |
| `user.routes.js` | ⚠️ Incomplete | Only GET /:id |

### Modules — Farms (`src/modules/farms/`)
| File | Status | Notes |
|------|--------|-------|
| `farm.model.js` | ⚠️ Incomplete | Missing: farmMap.plotDivisions, irrigationType (enum), soilType, isOrganic. `boundary` field present as GeoJSON. |
| `farm.controller.js` | ⚠️ Incomplete | CRUD + boundary update. Missing: soil sub-route, summary route |
| `farm.routes.js` | ⚠️ Incomplete | Only basic CRUD + boundary |
| `farm.schema.js` | ✅ Working | Zod validation |

### Modules — Crops (`src/modules/crops/`)
| File | Status | Notes |
|------|--------|-------|
| `crop.model.js` | ❌ Incomplete | Minimal: only name, plantedDate, variety, seedSource, status. Missing: inputs[], growthStages[], diseaseHistory[], yieldEstimate, marketPrice |
| `crop.controller.js` | ⚠️ Incomplete | Only createCrop, getCrops, updateCrop. Missing: inputs log, growth stage, disease log, harvest, profit, due-yields |
| `crop.routes.js` | ⚠️ Incomplete | Basic CRUD only |
| `crop.schema.js` | ✅ Working | Zod validation |

### Modules — Soil (`src/modules/soil/`)
| File | Status | Notes |
|------|--------|-------|
| `soil.model.js` | ✅ Working | pH, N, P, K, organicCarbon, moisturePercent, lastTestedDate, reportUrl |
| `soil.controller.js` | ⚠️ Incomplete | addSoilRecord + getSoilRecords. Missing: single record, update, latest with recommendations |
| `soil.routes.js` | ⚠️ Incomplete | Only POST + GET by farmId |

### Modules — Water (`src/modules/water/`)
| File | Status | Notes |
|------|--------|-------|
| `water.model.js` | ✅ Working | farmId, date, litersUsed, method, durationMin, notes |
| `water.controller.js` | ⚠️ Incomplete | logWaterUsage + getWaterSummary. Missing: stats, efficiency, target, alerts |
| `water.routes.js` | ⚠️ Incomplete | Only 2 routes |

### Modules — Finance (`src/modules/finance/`)
| File | Status | Notes |
|------|--------|-------|
| `finance.model.js` | ⚠️ Incomplete | Missing: owner ref, loan/subsidy types, bankTransaction, profitMargin |
| `finance.controller.js` | ⚠️ Incomplete | addExpense, addIncome, getFinanceSummary. Missing: monthly, profit-analysis, bank-transaction, market-demand, new-crop-suggestion |
| `finance.routes.js` | ⚠️ Incomplete | Only 3 routes |

### Modules — Marketplace (`src/modules/marketplace/`)
| File | Status | Notes |
|------|--------|-------|
| `listing.model.js` | ⚠️ Incomplete | Missing: photos[], isOrganic, certifications[], inquiries[], availableFrom |
| `marketplace.controller.js` | ⚠️ Incomplete | createListing + getListings only; missing: update, delete, inquire, my-listings, nearby |
| `marketplace.routes.js` | ⚠️ Incomplete | Only 2 routes |
| `marketplace.schema.js` | ✅ Working | Zod validation |

### Modules — Weather (`src/modules/weather/`)
| File | Status | Notes |
|------|--------|-------|
| `weather.controller.js` | ⚠️ Incomplete | getCurrentWeather + getWeatherAdvice. Missing: forecast, history, log, full advice rules |
| `weather.service.js` | ⚠️ Incomplete | fetchCurrentWeather — mocked, needs OpenWeatherMap integration |
| `weather.routes.js` | ⚠️ Incomplete | Only 2 routes |

### Modules — Women Health (`src/modules/women-health/`)
| File | Status | Notes |
|------|--------|-------|
| `health.model.js` | ⚠️ Incomplete | Missing: heatExposure (temp/uvIndex), mood, alerts[], healthTips[], menstrualCycle |
| `health.controller.js` | ⚠️ Incomplete | logHealth + getHealthAdvice only. Missing: getLogs, summary, tips, alerts, journal, tools |
| `health.routes.js` | ⚠️ Incomplete | Only 2 routes |

### Modules — Detection (`src/modules/detection/`)
| File | Status | Notes |
|------|--------|-------|
| `detection.controller.js` | ⚠️ Incomplete | analyzeImage works. DetectionLog schema defined inline (should be separate model). Stores `rawMetaEncrypted` — ok but spec says metadata only. |
| `detection.live.controller.js` | ✅ Working | SSE + child_process.spawn for live streaming. Needs to point to `runner_stream.py` (not `veg_yolo_pipeline_final.py`) |
| `detection.service.js` | ✅ Working | runPythonDetection via exec + JSON stdout parsing |
| `detection.routes.js` | ✅ Working | /analyze, /live/start, /live/stop, /live/events |

### Modules — Distributors (`src/modules/distributors/`)
| File | Status | Notes |
|------|--------|-------|
| `distributor.model.js` | ⚠️ Incomplete | Likely basic — needs rating, isVerified, commodities |
| `distributors.controller.js` | ⚠️ Incomplete | getDistributors only; missing: add, nearby, contact |
| `distributors.routes.js` | ⚠️ Incomplete | Only GET / |

### Modules — Schemes (`src/modules/schemes/`)
| File | Status | Notes |
|------|--------|-------|
| `schemes.controller.js` | ❌ Incomplete | Returns hardcoded static array (2 items). No database model! |
| `schemes.routes.js` | ⚠️ Incomplete | Only GET / |
| `GovScheme.model.js` | ❌ Missing | No model exists |

### Modules — Recommendations (`src/modules/recommendations/`)
| File | Status | Notes |
|------|--------|-------|
| `reco.controller.js` | ⚠️ Incomplete | Only getCropRecommendations |
| `reco.service.js` | ⚠️ Incomplete | Returns hardcoded static array |
| `reco.routes.js` | ⚠️ Incomplete | Only 1 route |

### Modules — Content (`src/modules/content/`)
| File | Status | Notes |
|------|--------|-------|
| `content.controller.js` | ⚠️ Incomplete | Returns static content list |
| `content.routes.js` | ✅ Working | GET / |

### Modules — Onboarding (`src/modules/onboarding/`)
| File | Status | Notes |
|------|--------|-------|
| `onboarding.controller.js` | ✅ Working | completeOnboarding — writes user profile fields |
| `onboarding.routes.js` | ✅ Working | POST / |
| `onboarding.schema.js` | ✅ Working | Zod validation |

### Modules — Crypto (`src/modules/crypto/`)
| File | Status | Notes |
|------|--------|-------|
| `crypto.routes.js` | ✅ Working | RSA public key endpoint |
| `crypto.controller.js` | ✅ Working | Returns RSA public key for frontend |

### Missing Modules (need to be created from scratch)
| Module | Status |
|--------|--------|
| `ByProduct` | ❌ Missing — no model, no routes, no controller |
| `Notification` | ❌ Missing — no model, no routes, no controller |
| `Language` | ❌ Missing — no routes, no controller |

---

## What Needs to be Built from Scratch
1. **Models:** GovScheme, ByProduct, Notification, DetectionLog (separate file)
2. **Modules:** language/, notification/, byproduct/ (complete)
3. **Utils:** ApiError.js, ApiResponse.js, calculations.js, weatherHelper.js, languageHelper.js
4. **Config:** cloudinary.js, axiosInstance.js
5. **Middleware:** upload.middleware.js, language.middleware.js
6. **Scripts:** scripts/seedSchemes.js
7. **server.js:** Needs SIGTERM/SIGINT graceful shutdown + /api/v1/health-check route

## What Needs to be Restructured / Completed
1. All existing controllers need fuller implementations (see status map above)
2. User.model.js — add missing fields (location, profilePhoto, healthProfile, language)
3. Crop.model.js — add inputs[], growthStages[], diseaseHistory[], yieldEstimate, marketPrice
4. Farm.model.js — add plotDivisions, irrigationSystem enum, soilType, isOrganic
5. Health.model.js — add heatExposure temp/uvIndex, mood enum, alerts[], menstrualCycle
6. Finance.model.js — add loan/subsidy enum types, bankTransaction object, profitMargin
7. errorHandler.js — properly handle Mongoose errors + JWT errors
8. Detection: DetectionLog model should be a proper separate model file
9. Schemes: needs GovScheme model + real database-backed controller
10. package.json: install cloudinary, http-proxy-middleware, ws, express-validator, bcryptjs

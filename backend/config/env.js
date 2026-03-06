import dotenv from 'dotenv';
dotenv.config();

// Server
export const PORT = process.env.PORT || 5000;
export const HOST = process.env.HOST || '0.0.0.0';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';

// Database
export const MONGODB_URI = process.env.MONGODB_URI;

// JWT (using existing key names from .env)
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_TTL_MIN = parseInt(process.env.JWT_ACCESS_TTL_MIN || '15', 10);
export const JWT_REFRESH_TTL_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || '7', 10);

// Cookies
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

// Encryption (existing keys — DO NOT rename)
export const RSA_PUBLIC_KEY = process.env.RSA_PUBLIC_KEY;
export const RSA_PRIVATE_KEY = process.env.RSA_PRIVATE_KEY;
export const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;
export const ENCRYPTION_KEY_ID = process.env.ENCRYPTION_KEY_ID || 'v1';

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

// Weather
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
export const WEATHER_PROVIDER = process.env.WEATHER_PROVIDER || 'mock';

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Python Pipeline
export const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
export const PYTHON_PIPELINE_PORT = parseInt(process.env.PYTHON_PIPELINE_PORT || '5001', 10);
export const PYTHON_PIPELINE_PATH = process.env.PYTHON_PIPELINE_PATH || '../pipeline/veg_yolo_pipeline_final.py';
export const DETECTION_SCRIPT_PATH = process.env.DETECTION_SCRIPT_PATH || '../pipeline/runner.py';
export const DETECTION_TIMEOUT_MS = parseInt(process.env.DETECTION_TIMEOUT_MS || '30000', 10);

// Translation / SMS
export const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
export const SMS_API_KEY = process.env.SMS_API_KEY;

// Market
export const MARKET_PRICE_API_KEY = process.env.MARKET_PRICE_API_KEY;

// Feature toggles
export const FEATURE_TOGGLES = (() => {
    try {
        return JSON.parse(process.env.FEATURE_TOGGLES || '{}');
    } catch {
        return {};
    }
})();

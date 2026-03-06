import {
  BarChart3,
  Leaf,
  Droplets,
  Heart,
  DollarSign,
  Store,
  Recycle,
  BookOpen,
  Truck,
  Zap,
  MessageSquare,
  Settings,
  AlertCircle,
  Globe,
} from 'lucide-react';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const FEATURES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/dashboard',
    description: 'Overview of your farm',
  },
  {
    id: 'farm',
    label: 'Farm',
    icon: Leaf,
    path: '/farm',
    description: 'Manage your farms',
  },
  {
    id: 'crop',
    label: 'Crops',
    icon: Leaf,
    path: '/crop',
    description: 'Track crop growth',
  },
  {
    id: 'soil',
    label: 'Soil',
    icon: Leaf,
    path: '/soil',
    description: 'Soil quality monitoring',
  },
  {
    id: 'water',
    label: 'Water',
    icon: Droplets,
    path: '/water',
    description: 'Water usage tracking',
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: AlertCircle,
    path: '/weather',
    description: 'Weather forecasts',
  },
  {
    id: 'health',
    label: 'Health',
    icon: Heart,
    path: '/health',
    description: 'Health & wellness',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    path: '/finance',
    description: 'Financial records',
  },
  {
    id: 'market',
    label: 'Market',
    icon: Store,
    path: '/market',
    description: 'Marketplace',
  },
  {
    id: 'byproduct',
    label: 'By-Products',
    icon: Recycle,
    path: '/byproduct',
    description: 'By-product management',
  },
  {
    id: 'scheme',
    label: 'Schemes',
    icon: BookOpen,
    path: '/scheme',
    description: 'Government schemes',
  },
  {
    id: 'distributor',
    label: 'Distributors',
    icon: Truck,
    path: '/distributor',
    description: 'Find distributors',
  },
  {
    id: 'detection',
    label: 'Detection',
    icon: Zap,
    path: '/detection',
    description: 'Disease detection',
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    icon: AlertCircle,
    path: '/recommendation',
    description: 'Get recommendations',
  },
  {
    id: 'notification',
    label: 'Notifications',
    icon: MessageSquare,
    path: '/notification',
    description: 'View notifications',
  },
  {
    id: 'language',
    label: 'Language',
    icon: Globe,
    path: '/language',
    description: 'Language settings',
  },
];

export const CROP_TYPES = [
  'vegetable',
  'fruit',
  'grain',
  'pulse',
  'spice',
  'cash_crop',
  'fodder',
  'flower'
];

export const SOIL_TYPES = [
  { value: 'sandy', label: 'Sandy' },
  { value: 'loamy', label: 'Loamy' },
  { value: 'clay', label: 'Clay' },
  { value: 'silty', label: 'Silty' },
  { value: 'peaty', label: 'Peaty' },
  { value: 'chalky', label: 'Chalky' },
];

export const IRRIGATION_METHODS = [
  { value: 'drip', label: 'Drip Irrigation' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'flood', label: 'Flood Irrigation' },
  { value: 'micro', label: 'Micro Irrigation' },
  { value: 'rainwater', label: 'Rainwater Harvesting' },
];

export const WATER_SOURCES = [
  { value: 'borewell', label: 'Borewell' },
  { value: 'canal', label: 'Canal' },
  { value: 'river', label: 'River' },
  { value: 'tank', label: 'Tank/Pond' },
  { value: 'rainwater', label: 'Rainwater' },
  { value: 'well', label: 'Well' },
];

export const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

export const HEALTH_MOODS = ['happy', 'neutral', 'tired', 'unwell', 'stressed'];

export const TRANSACTION_TYPES = ['income', 'expense', 'loan', 'subsidy', 'repayment'];

export const CROP_STAGES = ['planted', 'growing', 'ready_to_harvest', 'harvested', 'failed'];

export const MARKET_STATUSES = ['available', 'reserved', 'sold'];

export const PRODUCT_CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'pulses', label: 'Pulses' },
  { value: 'spices', label: 'Spices' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'tractor', label: 'Tractors & Heavy Mach.' },
  { value: 'tool', label: 'Farming Tools' },
];

export const MARKET_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Dairy',
  'Livestock',
];

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  ka: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
};

export const AREA_UNITS = ['acres', 'hectares', 'square meters'];

export const WATER_SUPPLY_SYSTEMS = [
  'Flood Irrigation',
  'Sprinkler',
  'Drip Irrigation',
  'Rainwater Harvesting',
];

export const MESSAGES = {
  loading: 'Loading...',
  noData: 'No data available',
  error: 'Something went wrong. Please try again.',
  success: 'Operation completed successfully',
  deleteConfirm: 'Are you sure you want to delete this item?',
  loginRequired: 'Please log in to continue',
  unauthorized: 'You do not have permission to perform this action',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

/**
 * Vision Service Endpoints
 * 
 * Architecture:
 * - React Frontend (http://localhost:5173)
 *   ↓
 * - Express Backend Proxy (http://localhost:3000/api/vision/*)
 *   ↓
 * - Python Flask Vision Service (http://localhost:5000/*)
 * 
 * All vision requests go through the Express backend for:
 * ✓ CORS handling
 * ✓ Health monitoring
 * ✓ Rate limiting
 * ✓ Authentication (future)
 */
export const VISION_API = {
  BASE: '/api',
  // MJPEG Streams (proxied through Express -> Flask)
  LIVE: '/api/vision/live',        // → Flask /video_feed_main
  MAP: '/api/vision/map',          // → Flask /video_feed_map
  // JSON Endpoints (proxied through Express -> Flask)
  METRICS: '/api/vision/metrics',  // → Flask /metrics
  HEALTH: '/api/vision/health',    // → Flask /health
  SYSTEM_HEALTH: '/api/system/health',
};

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  METRICS: 5000,           // Vision metrics: 5 seconds (increased from 2s to avoid rate limits)
  HEALTH_CHECK: 30000,     // System health: 30 seconds (increased from 15s)
  STATUS: 10000,           // Status updates: 10 seconds (increased from 5s)
  VISION_FEED: 500,        // Vision feed refresh: 500ms (smooth streaming)
};

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 10,
  INITIAL_DELAY: 3000,     // 3 seconds
  MAX_DELAY: 30000,        // 30 seconds max
  BACKOFF_FACTOR: 1.5,     // Exponential backoff
};

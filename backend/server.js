import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

import connectDB from './config/db.js'
import { languageMiddleware } from './middleware/language.middleware.js'
import { errorHandler } from './middleware/error.middleware.js'
import iotSimulator from './services/iotSimulator.js'
import { initVisionService, stopVisionService } from './services/visionService.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import farmRoutes from './routes/farm.routes.js'
import cropRoutes from './routes/crop.routes.js'
import soilRoutes from './routes/soil.routes.js'
import weatherRoutes from './routes/weather.routes.js'
import waterRoutes from './routes/water.routes.js'
import healthRoutes from './routes/health.routes.js'
import financeRoutes from './routes/finance.routes.js'
import marketRoutes from './routes/market.routes.js'
import byproductRoutes from './routes/byproduct.routes.js'
import schemeRoutes from './routes/scheme.routes.js'
import distributorRoutes from './routes/distributor.routes.js'
import detectionRoutes from './routes/detection.routes.js'
import recommendationRoutes from './routes/recommendation.routes.js'
import languageRoutes from './routes/language.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import visionRoutes from './routes/vision.routes.js'
import systemRoutes from './routes/system.routes.js'
import aiRoutes from './routes/ai.routes.js'
import { WebSocketServer } from 'ws'

const app = express()

// Security and parsing middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
})

// Exempts certain routes from rate limiting
const visionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1 minute window
  max: 300,                     // Allow 300 requests per minute for vision (5 per second)
  skip: (req) => req.path.startsWith('/api/vision') || req.path.startsWith('/api/system')
})

// Apply general limiter to all /api routes
app.use('/api', limiter)
// Apply generous limiter for vision/system routes
app.use('/api/vision', visionLimiter)
app.use('/api/system', visionLimiter)

// Global language middleware
app.use(languageMiddleware)

// Health check
app.get('/api/v1/health-check', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  })
})

// Mount all routes under /api/v1
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/farm', farmRoutes)
app.use('/api/v1/crop', cropRoutes)
app.use('/api/v1/soil', soilRoutes)
app.use('/api/v1/weather', weatherRoutes)
app.use('/api/v1/water', waterRoutes)
app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/finance', financeRoutes)
app.use('/api/v1/market', marketRoutes)
app.use('/api/v1/byproduct', byproductRoutes)
app.use('/api/v1/scheme', schemeRoutes)
app.use('/api/v1/distributor', distributorRoutes)
app.use('/api/v1/detection', detectionRoutes)
app.use('/api/v1/recommendation', recommendationRoutes)
app.use('/api/v1/language', languageRoutes)
app.use('/api/v1/notification', notificationRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/vision', visionRoutes)
app.use('/api/system', systemRoutes)
app.use('/api/v1/ai', aiRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler (MUST BE LAST)
app.use(errorHandler)

// Initialize WebSocket server
const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server })
  let broadcastInterval = null

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected')

    if (iotSimulator.getCurrentState) {
      ws.send(JSON.stringify({ type: 'iot_update', payload: iotSimulator.getCurrentState() }))
    }

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message)
    })
  })

  // Poll simulator and broadcast to all connected clients
  broadcastInterval = setInterval(() => {
    const data = iotSimulator.getCurrentState ? iotSimulator.getCurrentState() : null
    if (data) {
      const msg = JSON.stringify({ type: 'iot_update', payload: data })
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg)
      })
    }
  }, 3000)

  // Store interval reference for cleanup
  return {
    wss,
    cleanup: () => {
      if (broadcastInterval) {
        clearInterval(broadcastInterval)
      }
      wss.clients.forEach(client => client.close())
      wss.close()
    }
  }
}

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB()

    // Start IoT Simulator for live sensor data
    await iotSimulator.start()

    // Start Express server FIRST (non-blocking)
    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`)
      console.log(`📍 Environment: ${process.env.NODE_ENV}`)
      console.log(`🔗 Client origin: ${process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL}`)
      console.log(`🤖 IoT Simulator: Running`)

      const wsManager = initWebSocket(server)
      console.log(`🔌 WebSocket server: Running`)

      if (!process.env.OPENWEATHER_API_KEY) {
        console.warn('⚠️  WARNING: OPENWEATHER_API_KEY not set')
      }
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.warn('⚠️  WARNING: CLOUDINARY_CLOUD_NAME not set')
      }
      if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
        console.warn('⚠️  WARNING: GOOGLE_TRANSLATE_API_KEY not set')
      }

      const gracefulShutdown = () => {
        console.log('\n🛑 Shutting down gracefully...')
        iotSimulator.stop()
        stopVisionService()
        
        // Cleanup WebSocket manager
        if (wsManager && wsManager.cleanup) {
          wsManager.cleanup()
        }
        
        server.close(async () => {
          await mongoose.connection.close()
          console.log('✅ Server and MongoDB connection closed')
          process.exit(0)
        })
      }

      process.on('SIGTERM', gracefulShutdown)
      process.on('SIGINT', gracefulShutdown)
    })

    // Initialize Vision Service in background (non-blocking)
    initVisionService().then(() => {
      console.log(`👁️  Vision Service: Initialized`)
    }).catch((error) => {
      console.error(`👁️  Vision Service: Failed to initialize - ${error.message}`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()

export default app

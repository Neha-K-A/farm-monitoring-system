/**
 * System Health Routes
 * Comprehensive health check for all services
 */

import express from 'express'
import http from 'http'
import https from 'https'

const router = express.Router()

// Vision service configuration
const VISION_SERVICE_URL = process.env.VISION_SERVICE_URL || 'http://localhost:5000'
const VISION_HEALTH_TIMEOUT = 5000

console.log(`[SYSTEM ROUTES] Vision Service URL: ${VISION_SERVICE_URL}`)

/**
 * Helper to check service health
 */
async function checkServiceHealth(url, timeout = VISION_HEALTH_TIMEOUT) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn(`[SYSTEM] Health check timeout for ${url}`)
      resolve({ healthy: false, error: 'timeout', statusCode: 0 })
    }, timeout)

    const protocol = url.startsWith('https') ? https : http

    try {
      protocol.get(url, (res) => {
        clearTimeout(timeoutId)
        const healthy = res.statusCode >= 200 && res.statusCode < 300
        resolve({ 
          healthy,
          statusCode: res.statusCode,
          error: healthy ? null : `HTTP ${res.statusCode}`
        })

        // Consume the response to free up the connection
        res.on('data', () => {})
        res.on('end', () => {})
      }).on('error', (error) => {
        clearTimeout(timeoutId)
        console.warn(`[SYSTEM] Service health check failed for ${url}: ${error.message}`)
        resolve({ healthy: false, error: error.message || 'connection error', statusCode: 0 })
      })
    } catch (error) {
      clearTimeout(timeoutId)
      console.warn(`[SYSTEM] Exception checking ${url}: ${error.message}`)
      resolve({ healthy: false, error: error.message || 'unknown error', statusCode: 0 })
    }
  })
}

/**
 * GET /api/system/health
 * Comprehensive system health check
 * Returns status of backend, vision service, and camera connection
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now()

    // 1. Backend is always healthy (this service is running)
    const backendStatus = {
      healthy: true,
      service: 'Backend API',
      port: process.env.PORT || 3000,
      uptime: process.uptime(),
      error: null
    }

    // 2. Check Vision Service
    let visionStatus = {
      healthy: false,
      service: 'Vision Service',
      port: 5000,
      url: VISION_SERVICE_URL,
      error: 'Checking...'
    }

    try {
      const visionHealthCheck = await checkServiceHealth(`${VISION_SERVICE_URL}/health`, VISION_HEALTH_TIMEOUT)
      visionStatus.healthy = visionHealthCheck.healthy
      visionStatus.statusCode = visionHealthCheck.statusCode
      visionStatus.error = visionHealthCheck.error
      console.log(`[SYSTEM] Vision health: ${visionStatus.healthy}`)
    } catch (error) {
      visionStatus.error = error.message
      console.error(`[SYSTEM] Vision check exception: ${error.message}`)
    }

    // 3. Check Vision Metrics Endpoint
    let metricsStatus = {
      healthy: false,
      service: 'Vision Metrics',
      url: `${VISION_SERVICE_URL}/metrics`,
      error: 'Checking...'
    }

    try {
      const metricsCheck = await checkServiceHealth(`${VISION_SERVICE_URL}/metrics`, VISION_HEALTH_TIMEOUT)
      metricsStatus.healthy = metricsCheck.healthy
      metricsStatus.statusCode = metricsCheck.statusCode
      metricsStatus.error = metricsCheck.error || (metricsCheck.healthy ? null : 'Metrics unavailable')
      console.log(`[SYSTEM] Metrics health: ${metricsStatus.healthy}`)
    } catch (error) {
      metricsStatus.error = error.message
      console.error(`[SYSTEM] Metrics check exception: ${error.message}`)
    }

    // Overall system health
    const systemHealthy = 
      backendStatus.healthy && 
      (visionStatus.healthy || metricsStatus.healthy)

    const responseTime = Date.now() - startTime

    // Response format
    const response = {
      status: systemHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      services: {
        backend: backendStatus,
        vision: visionStatus,
        metrics: metricsStatus
      },
      summary: {
        totalServices: 3,
        healthyServices: [
          backendStatus.healthy,
          visionStatus.healthy,
          metricsStatus.healthy
        ].filter(Boolean).length,
        environment: process.env.NODE_ENV || 'development',
        visionServiceUrl: VISION_SERVICE_URL
      }
    }

    console.log(`[SYSTEM] Health check complete: ${response.status}`)
    res.json(response)
  } catch (error) {
    console.error('[SYSTEM] Health check error:', error.message)
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      services: {
        backend: { healthy: true },
        vision: { healthy: false, error: error.message },
        metrics: { healthy: false, error: error.message }
      }
    })
  }
})

/**
 * GET /api/system/status
 * Quick status endpoint
 */
router.get('/status', async (req, res) => {
  try {
    const visionHealthCheck = await checkServiceHealth(`${VISION_SERVICE_URL}/health`, 3000)
    
    res.json({
      backend: 'up',
      vision: visionHealthCheck.healthy ? 'up' : 'down',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[SYSTEM] Status check error:', error.message)
    res.status(500).json({
      backend: 'up',
      vision: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router

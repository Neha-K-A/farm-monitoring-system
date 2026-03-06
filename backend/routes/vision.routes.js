/**
 * Vision Monitoring Routes
 * Proxies requests to the Python Flask vision service
 * 
 * Routes:
 * GET /api/vision/live      - Live detection feed (MJPEG)
 * GET /api/vision/map       - Farm map feed (MJPEG)
 * GET /api/vision/metrics   - JSON metrics
 * GET /api/vision/health    - Health check
 */

import express from 'express'
import http from 'http'
import https from 'https'

const router = express.Router()

// Vision service configuration
const VISION_SERVICE_URL = process.env.VISION_SERVICE_URL || 'http://localhost:5000'
const VISION_REQUEST_TIMEOUT = parseInt(process.env.VISION_TIMEOUT || '30000', 10)

console.log(`[VISION ROUTES] Service URL: ${VISION_SERVICE_URL}`)

/**
 * Helper function to proxy streaming requests
 */
function proxyStream(req, res, endpoint) {
  const url = `${VISION_SERVICE_URL}${endpoint}`
  const protocol = url.startsWith('https') ? https : http

  try {
    const proxyReq = protocol.get(url, (proxyRes) => {
      // Set proper headers for MJPEG (only once, check before sending)
      if (!res.headersSent) {
        res.writeHead(proxyRes.statusCode || 200, {
          'Content-Type': proxyRes.headers['content-type'] || 'multipart/x-mixed-replace; boundary=frame',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        })
      }

      // Pipe the response directly to client without buffering
      proxyRes.pipe(res)

      proxyRes.on('end', () => {
        res.end()
      })

      proxyRes.on('error', (error) => {
        console.error(`[VISION] Response stream error for ${endpoint}:`, error.message)
        res.end()
      })
    })

    // Set request timeout
    proxyReq.setTimeout(VISION_REQUEST_TIMEOUT)

    proxyReq.on('error', (error) => {
      console.error(`[VISION] Error proxying ${endpoint}:`, error.message)
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          error: 'Vision service unavailable', 
          details: error.message,
          url: VISION_SERVICE_URL 
        }))
      } else {
        res.end()
      }
    })

    proxyReq.on('timeout', () => {
      console.warn(`[VISION] Request timeout for ${endpoint}`)
      proxyReq.destroy()
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Vision service timeout' }))
      }
    })

    req.on('close', () => {
      console.log(`[VISION] Client disconnected from ${endpoint}`)
      proxyReq.destroy()
    })
  } catch (error) {
    console.error(`[VISION] Error setting up proxy for ${endpoint}:`, error)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to connect to vision service' }))
    }
  }
}

/**
 * GET /api/vision/live
 * Stream live detection feed
 */
router.get('/live', (req, res) => {
  console.log('[VISION] Requesting live detection feed')
  proxyStream(req, res, '/video_feed_main')
})

/**
 * GET /api/vision/map
 * Stream farm map feed
 */
router.get('/map', (req, res) => {
  console.log('[VISION] Requesting farm map feed')
  proxyStream(req, res, '/video_feed_map')
})

/**
 * GET /api/vision/metrics
 * Get metrics as JSON
 */
router.get('/metrics', async (req, res) => {
  try {
    const url = `${VISION_SERVICE_URL}/metrics`
    const protocol = url.startsWith('https') ? https : http

    const data = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Vision service timeout'))
      }, 8000) // 8 second timeout

      protocol.get(url, (proxyRes) => {
        clearTimeout(timeout)
        let body = ''

        proxyRes.on('data', (chunk) => {
          body += chunk.toString().slice(0, 1000000) // Limit to 1MB
        })

        proxyRes.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(new Error('Invalid JSON from vision service'))
          }
        })
      }).on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })

      // Set socket timeout
      protocol.get(url).setTimeout(8000)
    })

    res.setHeader('Cache-Control', 'no-cache')
    res.json(data)
  } catch (error) {
    console.warn('[VISION] Metrics unavailable:', error.message)
    res.status(503).json({
      error: 'Vision service unavailable',
      message: error.message,
      metrics: {
        fps: 0,
        total_frames: 0,
        objects_detected: 0,
        current_frame_objects: 0,
        crops: {},
        ripeness: {
          ripe: 0,
          unripe: 0,
          under_ripe: 0,
          over_ripe: 0
        }
      }
    })
  }
})

/**
 * GET /api/vision/health
 * Check vision service health
 */
router.get('/health', async (req, res) => {
  try {
    const url = `${VISION_SERVICE_URL}/health`
    const protocol = url.startsWith('https') ? https : http

    const data = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Health check timeout'))
      }, 5000)

      protocol.get(url, (proxyRes) => {
        clearTimeout(timeout)
        let body = ''

        proxyRes.on('data', (chunk) => {
          body += chunk
        })

        proxyRes.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(new Error('Invalid response'))
          }
        })
      }).on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })

    res.json({
      status: 'healthy',
      vision_service: data
    })
  } catch (error) {
    console.error('[VISION] Health check failed:', error.message)
    res.status(503).json({
      status: 'unhealthy',
      error: 'Vision service unavailable',
      details: error.message
    })
  }
})

export default router

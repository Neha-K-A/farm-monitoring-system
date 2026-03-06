/**
 * Vision Service Manager
 * Auto-starts and manages the Python vision pipeline
 */

import { spawn } from 'child_process'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let visionProcess = null
let isShuttingDown = false
let restartAttempts = 0
const MAX_RESTART_ATTEMPTS = 5

/**
 * Check if vision service is running
 */
export async function isVisionServiceRunning(port = 5000) {
  return new Promise((resolve) => {
    try {
      const req = http.get(`http://localhost:${port}/health`, (res) => {
        resolve(res.statusCode === 200)
        res.resume()
      })
      req.on('error', () => resolve(false))
      req.setTimeout(2000, () => {
        req.destroy()
        resolve(false)
      })
    } catch (err) {
      resolve(false)
    }
  })
}

/**
 * Start the vision service
 */
export function startVisionService() {
  if (isShuttingDown) {
    console.log('[VISION_SERVICE] Service is shutting down, not starting')
    return
  }

  if (visionProcess) {
    console.log('[VISION_SERVICE] Vision service already running')
    return
  }

  // Check max restart attempts
  if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
    console.error('[VISION_SERVICE] Max restart attempts reached. Giving up.')
    return
  }

  try {
    // Path to the vision pipeline
    const visionScriptPath = path.join(
      __dirname,
      '../../FarmVisionAI/final.py'
    )

    console.log('[VISION_SERVICE] Starting Python vision service...')
    console.log('[VISION_SERVICE] Script path:', visionScriptPath)

    // Spawn Python process
    visionProcess = spawn('python', [visionScriptPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: 1
      }
    })

    // Handle stdout
    visionProcess.stdout.on('data', (data) => {
      console.log(`[VISION_PIPELINE] ${data.toString().trim()}`)
    })

    // Handle stderr
    visionProcess.stderr.on('data', (data) => {
      console.error(`[VISION_PIPELINE_ERROR] ${data.toString().trim()}`)
    })

    // Handle process exit
    visionProcess.on('exit', (code) => {
      console.log(`[VISION_SERVICE] Process exited with code ${code}`)
      visionProcess = null

      // Attempt to restart if not shutting down
      if (!isShuttingDown && code !== 0) {
        restartAttempts += 1
        const delayMs = Math.min(5000 * Math.pow(1.5, restartAttempts - 1), 30000)
        console.log(`[VISION_SERVICE] Attempting restart in ${delayMs}ms (${restartAttempts}/${MAX_RESTART_ATTEMPTS})`)
        setTimeout(() => startVisionService(), delayMs)
      }
    })

    // Handle errors
    visionProcess.on('error', (error) => {
      console.error('[VISION_SERVICE] Failed to start:', error.message)
      visionProcess = null

      // Check if it's a Python not found error
      if (error.code === 'ENOENT') {
        console.error('[VISION_SERVICE] Python not found in PATH')
        console.error('[VISION_SERVICE] Please ensure Python 3 is installed and in PATH')
      }
    })

    console.log('[VISION_SERVICE] Vision service started (PID: ' + visionProcess.pid + ')')
  } catch (error) {
    console.error('[VISION_SERVICE] Error starting vision service:', error.message)
  }
}

/**
 * Stop the vision service
 */
export function stopVisionService() {
  if (!visionProcess) {
    console.log('[VISION_SERVICE] Vision service not running')
    return
  }

  isShuttingDown = true

  try {
    console.log('[VISION_SERVICE] Stopping vision service (PID: ' + visionProcess.pid + ')')
    visionProcess.kill('SIGTERM')

    // Force kill after 10 seconds
    setTimeout(() => {
      if (visionProcess) {
        console.log('[VISION_SERVICE] Force killing vision service')
        visionProcess.kill('SIGKILL')
      }
    }, 10000)
  } catch (error) {
    console.error('[VISION_SERVICE] Error stopping service:', error.message)
  }
}

/**
 * Initialize vision service
 */
export async function initVisionService() {
  try {
    console.log('[VISION_SERVICE] Checking if vision service is running...')

    const isRunning = await isVisionServiceRunning()

    if (!isRunning) {
      console.log('[VISION_SERVICE] Service not running, attempting to start...')
      startVisionService()

      // Wait for service to start
      console.log('[VISION_SERVICE] Waiting for service to initialize...')
      let attempts = 0
      const maxAttempts = 30 // 30 seconds

      while (!await isVisionServiceRunning() && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
        console.log(`[VISION_SERVICE] Waiting... attempt ${attempts}/${maxAttempts}`)
      }

      if (await isVisionServiceRunning()) {
        console.log('[VISION_SERVICE] Vision service is ready!')
      } else {
        console.warn('[VISION_SERVICE] Vision service failed to start after 30 seconds')
      }
    } else {
      console.log('[VISION_SERVICE] Vision service already running')
    }
  } catch (error) {
    console.error('[VISION_SERVICE] Error initializing vision service:', error.message)
  }
}

export default {
  startVisionService,
  stopVisionService,
  initVisionService,
  isVisionServiceRunning
}

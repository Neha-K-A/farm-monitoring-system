import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, AlertTriangle } from 'lucide-react'
import { VISION_API, POLLING_INTERVALS, RETRY_CONFIG } from '../utils/constants.js'

/**
 * Farm Visualization with Live Vision Feed
 * Displays real-time MJPEG stream from Python vision pipeline
 */

const FarmVisualization = ({ iotData = {} }) => {
  const imgRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [frameCount, setFrameCount] = useState(0)
  const retryCountRef = useRef(0)
  const intervalRef = useRef(null)

  // Load vision feed with proper retry logic
  useEffect(() => {
    setIsLoading(true)
    const img = new Image()

    const handleLoad = () => {
      if (imgRef.current) {
        imgRef.current.src = img.src
      }
      setIsLoading(false)
      setHasError(false)
      retryCountRef.current = 0
      console.log('[UI] Vision stream connected')
    }

    const handleError = () => {
      console.error(`[UI] Vision stream lost (attempt ${retryCountRef.current + 1}/${RETRY_CONFIG.MAX_ATTEMPTS})`)
      setHasError(true)
      setIsLoading(false)

      // Implement exponential backoff with max retries
      if (retryCountRef.current < RETRY_CONFIG.MAX_ATTEMPTS) {
        retryCountRef.current += 1
        // Exponential backoff: 2s, 4s, 8s, 16s... up to MAX_DELAY
        const delayMs = Math.min(
          2000 * Math.pow(2, retryCountRef.current - 1),
          RETRY_CONFIG.MAX_DELAY
        )

        console.log(`Retrying in ${delayMs}ms...`)
        setTimeout(async () => {
          // Perform a health check before forcefully trying to reload the image
          try {
            const healthRes = await fetch(VISION_API.HEALTH)
            if (healthRes.ok) {
              loadFeed()
            } else {
              handleError() // Trigger next backoff step if still unhealthy
            }
          } catch (err) {
            handleError() // Trigger next backoff step if fetch fails
          }
        }, delayMs)
      } else {
        console.error('Max retries reached for vision feed')
      }
    }

    const loadFeed = () => {
      img.onload = handleLoad
      img.onerror = handleError
      // Removed cache busting (?t=Date.now()) to allow stable MJPEG streaming
      img.src = VISION_API.MAP
    }

    loadFeed()

    // No periodic interval reloading; MJPEG is a continuous push stream.
    // The browser will keep the connection open and update frames automatically.

    return () => {
      // Clean up Image object to stop streaming on unmount
      img.src = ''
    }
  }, [])

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#1A1A2E] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Eye size={14} className="text-[#2ECC71]" />
          Live Vision Feed
        </h3>
        <motion.div
          className="flex items-center gap-1.5"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span
            className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-[#2ECC71]'
              }`}
          />
          <span className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider">
            {hasError ? 'Disconnected' : 'Live'}
          </span>
        </motion.div>
      </div>

      {/* Vision Feed Container */}
      <div className="relative rounded-xl overflow-hidden mb-4 shadow-md" style={{ height: 200, background: '#000' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-white/60">Loading feed...</span>
            </motion.div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/10 backdrop-blur-sm z-10">
            <motion.div className="flex flex-col items-center gap-2" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <AlertTriangle size={20} className="text-red-400" />
              <span className="text-xs text-red-300">Vision service unavailable</span>
            </motion.div>
          </div>
        )}

        {/* Image Element */}
        <img
          ref={imgRef}
          alt="Farm map feed"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          style={{ filter: 'contrast(1.1) brightness(1.05)' }}
        />

        {/* Bottom Label */}
        <div
          className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] text-white/60 flex items-center gap-1"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <Eye size={10} />
          Top-Down Farm Map
        </div>

        {/* Frame Counter */}
        <motion.div
          key={frameCount}
          className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] text-white/60"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Frame #{frameCount}
        </motion.div>

        {/* Dummy/Simulated Detection Overlays */}
        {hasError && (
          <div className="absolute inset-0 z-20 pointer-events-none p-4">
            {/* Simulated Bounding Box 1 */}
            <motion.div
              className="absolute border-2 border-[#4CAF50] bg-[#4CAF50]/20 flex flex-col items-center justify-center p-2 rounded"
              style={{ top: '20%', left: '30%', width: '120px', height: '100px' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="bg-[#1B5E20]/80 text-[#FFFFFF] text-[10px] px-1 rounded absolute -top-4 whitespace-nowrap font-bold">Tomato | Healthy | 92%</span>
            </motion.div>

            {/* Simulated Bounding Box 2 */}
            <motion.div
              className="absolute border-2 border-red-500 bg-red-500/20 flex flex-col items-center justify-center p-2 rounded"
              style={{ top: '60%', left: '70%', width: '90px', height: '90px' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="bg-red-600/80 text-[#FFFFFF] text-[10px] px-1 rounded absolute -top-4 whitespace-nowrap font-bold">Wheat | Dry Patch | 88%</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#636E72]">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#2ECC71]" />
          Streaming @ 720p
        </span>
        <span>Source: Vision AI Service</span>
      </div>
    </motion.div>
  )
}

export default FarmVisualization


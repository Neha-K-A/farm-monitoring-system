import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { VISION_API, POLLING_INTERVALS } from '../utils/constants.js'

/**
 * System Status Indicator
 * Displays health status of all services
 */

const SystemStatusIndicator = () => {
  const [healthStatus, setHealthStatus] = useState({
    backend: 'checking',
    vision: 'checking',
    metrics: 'checking'
  })
  const [responseTime, setResponseTime] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    const checkHealth = async () => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 10000) // 10 second timeout

      try {
        const startTime = Date.now()
        const response = await fetch(VISION_API.SYSTEM_HEALTH, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal
        })
        clearTimeout(timeoutId)

        const data = await response.json()
        const time = Date.now() - startTime
        setResponseTime(time)

        setHealthStatus({
          backend: data.services?.backend?.healthy ? 'healthy' : 'error',
          vision: data.services?.vision?.healthy ? 'healthy' : 'error',
          metrics: data.services?.metrics?.healthy ? 'healthy' : 'error'
        })
      } catch (error) {
        clearTimeout(timeoutId)

        if (error.name === 'AbortError') {
          console.error('Health check timeout')
        } else {
          console.error('Health check failed:', error)
        }
        setHealthStatus({
          backend: 'error',
          vision: 'error',
          metrics: 'error'
        })
      }
    }

    // Initial check
    checkHealth()

    // Set interval with proper cleanup - use POLLING_INTERVALS.HEALTH_CHECK (15 seconds)
    intervalRef.current = setInterval(checkHealth, POLLING_INTERVALS.HEALTH_CHECK)

    // Cleanup interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-[#2ECC71]" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#E74C3C]" />
      case 'checking':
        return <Loader className="w-4 h-4 text-[#F39C12] animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-[#EAF9F1] border-[#C3E6CB]'
      case 'error':
        return 'bg-[#FDEDEC] border-[#FADBD8]'
      case 'checking':
        return 'bg-[#FFF8E1] border-[#FFEBA1]'
      default:
        return 'bg-surface/20 border-border'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Healthy'
      case 'error':
        return 'Offline'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const allHealthy = Object.values(healthStatus).every(s => s === 'healthy')

  return (
    <motion.div
      className="bg-[#FFFFFF]/80 border border-[#E0E0E0] rounded-2xl p-6 shadow-sm backdrop-blur-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
            <motion.div
              className={`w-2.5 h-2.5 rounded-full ${allHealthy ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]'}`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            System Infrastructure Status
          </h3>
          <span className="text-xs text-muted">{responseTime}ms</span>
        </div>

        {/* Service Status Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Backend Status */}
          <motion.div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all hover:shadow-md ${getStatusColor(
              healthStatus.backend
            )}`}
            whileHover={{ y: -2 }}
          >
            {getStatusIcon(healthStatus.backend)}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-wider truncate">Backend API</p>
              <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-tighter">{getStatusText(healthStatus.backend)}</p>
            </div>
          </motion.div>

          {/* Vision Status */}
          <motion.div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all hover:shadow-md ${getStatusColor(
              healthStatus.vision
            )}`}
            whileHover={{ y: -2 }}
          >
            {getStatusIcon(healthStatus.vision)}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-wider truncate">Vision Service</p>
              <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-tighter">{getStatusText(healthStatus.vision)}</p>
            </div>
          </motion.div>

          {/* Metrics Status */}
          <motion.div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all hover:shadow-md ${getStatusColor(
              healthStatus.metrics
            )}`}
            whileHover={{ y: -2 }}
          >
            {getStatusIcon(healthStatus.metrics)}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-wider truncate">Metrics Endpoint</p>
              <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-tighter">{getStatusText(healthStatus.metrics)}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default SystemStatusIndicator

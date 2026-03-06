import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import SystemStatusIndicator from '../../../components/SystemStatusIndicator.jsx'
import { VISION_API, POLLING_INTERVALS } from '../../../utils/constants.js'

/**
 * VisionMonitoring Page
 * Full computer vision analytics interface with live feeds and metrics
 */

const VisionMonitoring = () => {
  const [metrics, setMetrics] = useState({
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
  })

  const [healthStatus, setHealthStatus] = useState('healthy')
  const [fpsHistory, setFpsHistory] = useState([])
  const [detectionHistory, setDetectionHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Use ref to prevent duplicate intervals
  const intervalRef = useRef(null)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 3  // Reduced from 5 to 3 to avoid excessive retries
  const BACKOFF_MULTIPLIER = 2

  // Fetch metrics with throttling
  useEffect(() => {
    const fetchMetrics = async () => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 5000) // 5 second timeout

      try {
        const response = await fetch(VISION_API.METRICS, {
          signal: abortController.signal
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
          setHealthStatus('healthy')
          retryCountRef.current = 0

          // Update FPS history
          setFpsHistory((prev) => [...prev.slice(-29), { time: new Date().getSeconds(), fps: data.fps }])

          // Update detection history
          setDetectionHistory((prev) => [...prev.slice(-29), { time: new Date().getSeconds(), count: data.objects_detected }])
        } else if (response.status === 429) {
          console.warn('Rate limited - Vision service is busy, will retry with longer interval')
          setHealthStatus('unhealthy')
          // Don't retry immediately on 429 - let the interval handle it
        } else if (response.status === 404) {
          console.error('Vision metrics endpoint not found (404) - Vision service may not be running')
          setHealthStatus('unhealthy')
          // Don't retry 404s excessively - service is not available
        } else {
          console.error(`Vision metrics returned status ${response.status}`)
          setHealthStatus('unhealthy')
        }
      } catch (error) {
        clearTimeout(timeoutId)

        if (error.name === 'AbortError') {
          console.error('Metrics fetch timeout - network request exceeded 5 seconds')
        } else {
          console.error('Error fetching metrics:', error)
        }
        setHealthStatus('unhealthy')

        // Implement retry with exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1
          console.log(`Retrying metrics fetch (${retryCountRef.current}/${MAX_RETRIES})`)
          const delayMs = Math.min(
            2000 * Math.pow(2, retryCountRef.current - 1),
            30000
          )

          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = setTimeout(() => {
            fetchMetrics()
            // Reset interval after successful fetch
            if (healthStatus === 'healthy') {
              intervalRef.current = setInterval(fetchMetrics, POLLING_INTERVALS.METRICS)
            }
          }, delayMs)
          return
        } else {
          console.error('Max retries reached for metrics fetch')
        }
      }
      setIsLoading(false)
    }

    // Initial fetch
    fetchMetrics()

    // Set interval with proper cleanup - use POLLING_INTERVALS.METRICS (2000ms)
    intervalRef.current = setInterval(fetchMetrics, POLLING_INTERVALS.METRICS)

    // Cleanup interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // Chart colors
  const COLORS = {
    ripe: '#00ff00',
    unripe: '#00a5ff',
    under_ripe: '#64c8ff',
    over_ripe: '#0064ff',
    rotten: '#0000ff',
    infected: '#ff00ff'
  }

  // Ripeness data for pie chart
  const ripennessData = [
    { name: 'Ripe', value: metrics.ripeness.ripe, color: COLORS.ripe },
    { name: 'Unripe', value: metrics.ripeness.unripe, color: COLORS.unripe },
    { name: 'Under-ripe', value: metrics.ripeness.under_ripe, color: COLORS.under_ripe },
    { name: 'Over-ripe', value: metrics.ripeness.over_ripe, color: COLORS.over_ripe }
  ].filter((item) => item.value > 0)

  // Crops data for bar chart
  const cropsData = Object.entries(metrics.crops).map(([label, count]) => ({
    name: label.charAt(0).toUpperCase() + label.slice(1),
    count
  }))

  // Metric card animation
  const metricVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1 }
    })
  }

  // Health status badge
  const getHealthBadge = () => {
    const isHealthy = healthStatus === 'healthy'
    return (
      <motion.div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isHealthy
          ? 'bg-[#EAF9F1] text-[#2ECC71] border border-[#C3E6CB]'
          : 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]'
          }`}
        animate={{ scale: isHealthy ? 1 : 1.05 }}
        transition={{ duration: 0.5, repeat: !isHealthy ? Infinity : 0 }}
      >
        <motion.div
          className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]'}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {isHealthy ? 'SYSTEM OPERATIONAL' : 'SERVICE DISCONNECTED'}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-text">
      {/* Header */}
      <motion.div
        className="bg-[#FFFFFF] border-b border-[#E0E0E0] p-8 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-[#1A1A2E]">👁️ Vision Intelligence</h1>
            <p className="text-[#636E72] font-semibold uppercase tracking-wider text-xs">Real-time crop detection and health classification</p>
          </div>
          {getHealthBadge()}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* System Status Indicator */}
        <SystemStatusIndicator />

        {/* Video Feeds Row */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Live Detection Feed */}
          <motion.div
            className="card !p-0 overflow-hidden shadow-sm"
            whileHover={{ boxShadow: '0 20px 25px -5px rgba(27, 94, 32, 0.1)' }}
          >
            <div className="bg-[#FFFFFF] p-5 border-b border-[#E0E0E0]">
              <h2 className="text-lg font-bold flex items-center gap-3 text-[#1A1A2E]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF9F1] flex items-center justify-center">
                  <span className="text-[#2ECC71]">🎥</span>
                </div>
                Live Detection Feed
              </h2>
            </div>
            <div className="aspect-video bg-[#000000] flex items-center justify-center overflow-hidden relative shadow-inner">
              {!healthStatus || healthStatus === 'unhealthy' ? (
                <div className="w-full h-full bg-[#1A1A2E] relative flex items-center justify-center">
                  <span className="text-white/40 uppercase tracking-widest text-xs font-bold z-10 bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                    Simulated Camera Feed
                  </span>
                  <motion.div
                    className="absolute border-2 border-blue-500 bg-blue-500/10 flex flex-col items-center justify-center rounded"
                    style={{ top: '25%', left: '40%', width: '150px', height: '120px' }}
                    animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="bg-blue-600 font-mono text-white text-[10px] px-1 absolute -top-4 left-0">DETECT: Leaf Disease 85%</span>
                  </motion.div>
                </div>
              ) : (
                <img
                  src={VISION_API.LIVE}
                  alt="Live detection feed"
                  className="w-full h-full object-cover"
                  onError={() => setHealthStatus('unhealthy')}
                />
              )}
            </div>
          </motion.div>

          {/* Farm Map Feed */}
          <motion.div
            className="card !p-0 overflow-hidden shadow-sm"
            whileHover={{ boxShadow: '0 20px 25px -5px rgba(27, 94, 32, 0.1)' }}
          >
            <div className="bg-[#FFFFFF] p-5 border-b border-[#E0E0E0]">
              <h2 className="text-lg font-bold flex items-center gap-3 text-[#1A1A2E]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF9F1] flex items-center justify-center">
                  <span className="text-[#2ECC71]">🗺️</span>
                </div>
                Top-Down Farm Map
              </h2>
            </div>
            <div className="aspect-video bg-[#000000] flex items-center justify-center overflow-hidden relative shadow-inner">
              {!healthStatus || healthStatus === 'unhealthy' ? (
                <div className="w-full h-full bg-[#1A1A2E] relative flex items-center justify-center">
                  <span className="text-white/40 uppercase tracking-widest text-xs font-bold z-10 bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                    Simulated Farm Map
                  </span>
                  <motion.div
                    className="absolute border border-green-500 bg-green-500/20"
                    style={{ top: '10%', left: '10%', width: '40%', height: '80%' }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute border border-red-500 bg-red-500/20"
                    style={{ top: '40%', right: '10%', width: '30%', height: '40%' }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </div>
              ) : (
                <img
                  src={VISION_API.MAP}
                  alt="Farm map feed"
                  className="w-full h-full object-cover"
                  onError={() => setHealthStatus('unhealthy')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Metrics Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* FPS Metric */}
          <motion.div
            custom={0}
            variants={metricVariants}
            initial="hidden"
            animate="visible"
            className="card flex flex-col justify-between"
          >
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">Frames Per Second</p>
            <motion.h3
              className="text-3xl font-bold text-[#2196F3]"
              key={metrics.fps}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {metrics.fps.toFixed(1)}
            </motion.h3>
            <p className="text-[10px] text-[#636E72] mt-2 font-bold uppercase">Streaming rate</p>
          </motion.div>

          <motion.div
            custom={1}
            variants={metricVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DCEEDC] shadow-sm transform transition-all hover:scale-[1.02]"
          >
            <p className="text-[#6B8F6B] text-sm mb-1 font-bold">Total Frames</p>
            <motion.h3
              className="text-3xl font-bold text-[#9C27B0]"
              key={metrics.total_frames}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {metrics.total_frames.toLocaleString()}
            </motion.h3>
            <p className="text-[10px] text-[#636E72] mt-2 font-bold uppercase">Session total</p>
          </motion.div>

          <motion.div
            custom={2}
            variants={metricVariants}
            initial="hidden"
            animate="visible"
            className="card flex flex-col justify-between"
          >
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">Objects Detected</p>
            <motion.h3
              className="text-3xl font-bold text-[#2ECC71]"
              key={metrics.objects_detected}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {metrics.objects_detected}
            </motion.h3>
            <p className="text-[10px] text-[#636E72] mt-2 font-bold uppercase">Current: {metrics.current_frame_objects}</p>
          </motion.div>

          <motion.div
            custom={3}
            variants={metricVariants}
            initial="hidden"
            animate="visible"
            className="card flex flex-col justify-between"
          >
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">Camera Status</p>
            <motion.div
              className="flex items-center gap-2 mt-2"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-3 h-3 bg-[#F39C12] rounded-full" />
              <p className="text-lg font-bold text-[#F39C12] uppercase tracking-wider">Active</p>
            </motion.div>
            <p className="text-[10px] text-[#636E72] mt-2 font-bold uppercase">IP Webcam Connected</p>
          </motion.div>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* FPS Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-bold mb-6 text-[#1A1A2E]">FPS Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fpsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="time" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="fps"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detection Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-bold mb-6 text-[#1A1A2E]">Detection Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={detectionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="time" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Analytics Row */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Ripeness Distribution */}
          {ripennessData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-6 text-[#1A1A2E]">Ripeness Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ripennessData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ripennessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Crop Distribution */}
          {cropsData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-6 text-[#1A1A2E]">Detected Crops</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cropsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                  <XAxis dataKey="name" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#9C27B0" isAnimationActive={true} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Status Panel */}
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-lg font-bold mb-6 text-[#1A1A2E]">System Infrastructure Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold uppercase tracking-tight">
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] shadow-sm">
              <p className="text-[#636E72] text-[10px] mb-1.5">Model</p>
              <p className="text-[#1A1A2E]">YOLOv8m-seg</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] shadow-sm">
              <p className="text-[#636E72] text-[10px] mb-1.5">Input Res</p>
              <p className="text-[#1A1A2E]">512×512</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] shadow-sm">
              <p className="text-[#636E72] text-[10px] mb-1.5">Confidence</p>
              <p className="text-[#1A1A2E]">0.40</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] shadow-sm">
              <p className="text-[#636E72] text-[10px] mb-1.5">Health States</p>
              <p className="text-[#1A1A2E]">8 Classes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default VisionMonitoring

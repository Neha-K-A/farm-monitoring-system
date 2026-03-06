import HealthLog from '../models/HealthLog.model.js'
import Notification from '../models/Notification.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Generate health alerts and tips
const generateHealthAlertsAndTips = (log) => {
  const alerts = []
  const tips = []

  if (log.workHours > 10) alerts.push('Work hours exceed 10: Risk of fatigue')
  if (log.workHours > 8 && log.heatExposure?.temperature > 35) {
    alerts.push('CRITICAL: Heat stroke risk - High temp + long work hours')
    tips.push('Take 30-min rest in shade every 2 hours, drink 1L water every 30 min')
  }
  if (log.waterIntake < 2) alerts.push('Dehydration risk: Intake < 2L')
  if (log.mood === 'unwell') tips.push('Consult health worker today')
  if (log.menstrualCycle?.phase === 'menstrual') tips.push('Heavy work not recommended during menstrual phase')
  if (log.symptoms?.length > 0) alerts.push(`Symptoms reported: ${log.symptoms.join(', ')}`)
  if (log.heatExposure?.duration > 120) tips.push('You spent 2+ hours in heat: Eat iron-rich foods (spinach, dates)')

  if (tips.length === 0) tips.push('Stay hydrated and take regular breaks during farm work')
  return { alerts, tips }
}

// Log health (women-centric)
export const logHealth = asyncHandler(async (req, res) => {
  const { date, workHours, heatExposure, waterIntake, mood, symptoms, menstrualCycle } = req.body
  
  if (workHours === undefined) throw new ApiError(400, 'Work hours are required')

  const { alerts, tips } = generateHealthAlertsAndTips({ workHours, heatExposure, waterIntake, mood, symptoms, menstrualCycle })

  const log = await HealthLog.create({
    user: req.user._id,
    date: date || new Date(),
    workHours,
    heatExposure,
    waterIntake,
    mood,
    symptoms,
    menstrualCycle,
    alerts,
    healthTips: tips
  })

  // Create notification if critical alerts
  if (alerts.some(a => a.includes('CRITICAL'))) {
    await Notification.create({
      recipient: req.user._id,
      title: 'Health Alert',
      message: alerts.join('; '),
      type: 'health'
    })
  }

  res.status(201).json(new ApiResponse(201, log, 'Health logged with alerts and tips'))
})

// Get health logs
export const getHealthLogs = asyncHandler(async (req, res) => {
  const logs = await HealthLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30)
  res.json(new ApiResponse(200, logs, 'Health logs retrieved'))
})

// Get health summary
export const getHealthSummary = asyncHandler(async (req, res) => {
  const logs = await HealthLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30)
  const avgWorkHours = logs.length > 0 ? (logs.reduce((sum, l) => sum + l.workHours, 0) / logs.length).toFixed(1) : 0
  const moodCounts = { good: 0, average: 0, fatigued: 0, unwell: 0 }
  logs.forEach(l => moodCounts[l.mood]++)

  res.json(new ApiResponse(200, {
    logsCount: logs.length,
    averageWorkHours: avgWorkHours,
    moodDistribution: moodCounts
  }, 'Health summary retrieved'))
})

// Get health tips based on recent logs
export const getHealthTips = asyncHandler(async (req, res) => {
  const recentLog = await HealthLog.findOne({ user: req.user._id }).sort({ date: -1 })
  const tips = recentLog?.healthTips || ['Stay hydrated', 'Take regular breaks', 'Eat nutritious food']
  res.json(new ApiResponse(200, tips, 'Health tips retrieved'))
})

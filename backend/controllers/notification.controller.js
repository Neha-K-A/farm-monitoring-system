import Notification from '../models/Notification.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
  res.json(new ApiResponse(200, notifications, 'Notifications retrieved'))
})

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  })
  res.json(new ApiResponse(200, { count }, 'Unread count retrieved'))
})

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) throw new ApiError(404, 'Notification not found')
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  notification.isRead = true
  await notification.save()
  res.json(new ApiResponse(200, notification, 'Notification marked as read'))
})

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) throw new ApiError(404, 'Notification not found')
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  await Notification.findByIdAndDelete(req.params.id)
  res.json(new ApiResponse(200, {}, 'Notification deleted'))
})

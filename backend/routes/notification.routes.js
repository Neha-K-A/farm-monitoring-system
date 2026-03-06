import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification
} from '../controllers/notification.controller.js'

const router = express.Router()

router.get('/', verifyJWT, getNotifications)
router.get('/unread-count', verifyJWT, getUnreadCount)
router.put('/:id/read', verifyJWT, markAsRead)
router.delete('/:id', verifyJWT, deleteNotification)

export default router

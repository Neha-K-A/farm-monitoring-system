import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: String,
    type: {
      type: String,
      enum: ['harvest_due','soil_alert','water_alert','scheme','disease','health','general']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedResource: {
      resourceType: String,
      resourceId: mongoose.Schema.Types.ObjectId
    }
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1 })
notificationSchema.index({ isRead: 1 })

export default mongoose.model('Notification', notificationSchema)

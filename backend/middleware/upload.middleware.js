import multer from 'multer'
import ApiError from '../utils/ApiError.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, WebP images are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

export const uploadSingle = (field) => upload.single(field)
export const uploadMultiple = (field, max = 5) => upload.array(field, max)
export default upload

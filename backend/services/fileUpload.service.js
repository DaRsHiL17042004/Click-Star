// backend/services/fileUpload.service.js
// Uses Cloudinary when credentials are configured, otherwise stores files in ./uploads.
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED = /jpeg|jpg|png|gif|webp|mp4|mov|avi|quicktime/;
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (ALLOWED.test(ext) && ALLOWED.test(file.mimetype)) return cb(null, true);
  return cb(new Error('File type not allowed'), false);
};

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

let storage;
if (useCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `clickstar/portfolio/${req.user?.id || 'anonymous'}`,
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }),
  });
} else {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safe = path.basename(file.originalname).replace(/[^\w.-]+/g, '_');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`);
    },
  });
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 10 } });

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
module.exports.useCloudinary = useCloudinary;

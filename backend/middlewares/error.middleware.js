// backend/middlewares/error.middleware.js
const multer = require('multer');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Each file must be 10 MB or smaller' : err.message;
    return res.status(400).json({ message });
  }
  if (err && err.message === 'File type not allowed') {
    return res.status(400).json({ message: 'Only JPG, PNG, GIF, WebP, MP4, MOV or AVI files are allowed' });
  }
  if (err && err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }
  console.error(err);
  return res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong' });
};

const express = require('express');
const router = express.Router();
const { getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');
const validateToken = require('../middleware/validateTokenHandler');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use(validateToken);
router.route('/')
  .get(getGalleryImages)
  .post(upload.single('image'), createGalleryImage);
router.route('/:id')
  .put(upload.single('image'), updateGalleryImage) // Optional image update
  .delete(deleteGalleryImage);

module.exports = router;
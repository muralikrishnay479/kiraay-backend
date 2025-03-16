const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getProfile).put(updateProfile);
router.route('/:id').get(getPublicProfile);

module.exports = router;
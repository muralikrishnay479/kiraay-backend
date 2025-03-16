const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, deleteNotification } = require('../controllers/notificationController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getNotifications).post(createNotification);
router.route('/:id').delete(deleteNotification);

module.exports = router;
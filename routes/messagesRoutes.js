const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messagesController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').post(sendMessage).get(getMessages);

module.exports = router;
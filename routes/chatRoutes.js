const express = require('express');
const router = express.Router();
const { getChats, createChat, deleteChat } = require('../controllers/chatController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getChats).post(createChat);
router.route('/:id').delete(deleteChat);

module.exports = router;
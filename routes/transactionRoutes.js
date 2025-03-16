const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction } = require('../controllers/transactionController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getTransactions).post(createTransaction);

module.exports = router;
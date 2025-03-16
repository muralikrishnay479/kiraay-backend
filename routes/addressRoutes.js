const express = require('express');
const router = express.Router();
const { getAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getAddresses).post(createAddress);
router.route('/:id').put(updateAddress).delete(deleteAddress);

module.exports = router;
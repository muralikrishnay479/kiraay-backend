const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const validateToken = require('../middleware/validateTokenHandler');

router.route('/').get(getProducts); // Public
router.use(validateToken);
router.route('/').post(createProduct);
router.route('/:id').put(updateProduct).delete(deleteProduct);

module.exports = router;
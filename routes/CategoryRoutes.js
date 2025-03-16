const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const validateToken = require('../middleware/validateTokenHandler');

router.route('/').get(getCategories);
router.use(validateToken);
router.route('/').post(createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

module.exports = router;
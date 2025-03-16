const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);
router.route('/').get(getWishlist).post(addToWishlist);
router.route('/:id').delete(removeFromWishlist);

module.exports = router;
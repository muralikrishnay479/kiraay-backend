const { body, validationResult } = require('express-validator');

const validateUser = [
  body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateUser;
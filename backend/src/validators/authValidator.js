const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

const profileAddressValidator = [
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('addressLine2').optional().trim(),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state').optional().trim(),
  body('postalCode').optional().trim(),
  body('country').optional().trim()
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  profileAddressValidator
};











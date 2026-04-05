const { body } = require('express-validator');

const requestPhoneOtpValidator = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('preferSms').optional()
];

const verifyPhoneOtpValidator = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .matches(/^\d{6}$/)
    .withMessage('Enter the 6-digit verification code')
];

module.exports = {
  requestPhoneOtpValidator,
  verifyPhoneOtpValidator
};

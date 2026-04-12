const { body } = require('express-validator');

const embeddedCheckoutValidator = [
  body('orderId').isUUID().withMessage('orderId must be a valid UUID')
];

const syncCheckoutSessionValidator = [
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('sessionId is required')
    .isString()
];

module.exports = {
  embeddedCheckoutValidator,
  syncCheckoutSessionValidator
};

const { body, param, query } = require('express-validator');

const createOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one line item is required'),
  body('items.*.productId').isUUID().withMessage('Invalid product id'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryDate')
    .isISO8601()
    .withMessage('deliveryDate must be a valid date (YYYY-MM-DD)'),
  body('deliveryWindow').optional().isString().trim(),
  body('notes').optional().isString().trim(),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('addressLine2').optional().isString().trim(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').optional().isString().trim(),
  body('postalCode').optional().isString().trim(),
  body('country').optional().isString().trim()
];

const orderIdParam = [
  param('id').isUUID().withMessage('Invalid order id')
];

const listOrdersQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
];

module.exports = {
  createOrderValidator,
  orderIdParam,
  listOrdersQuery
};

const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const {
  createOrderValidator,
  orderIdParam,
  listOrdersQuery
} = require('../validators/orderValidator');

const router = express.Router();

router.use(authenticateToken);

router.get('/', listOrdersQuery, orderController.listMyOrders);
router.post('/', createOrderValidator, orderController.createOrder);
router.get('/:id', orderIdParam, orderController.getOrderById);
router.delete('/:id', orderIdParam, orderController.cancelOrder);

module.exports = router;

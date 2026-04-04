const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const db = require('../models');
const { Order, OrderItem, Product, User, sequelize } = db;
const {
  getOrderDeleteCutoffDays,
  evaluateOrderCancellation,
  decorateOrderForClient
} = require('../utils/orderDeletePolicy');

function normalizeDeliveryDateInput(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
    return m ? m[1] : null;
  }
  return null;
}

const orderInclude = [
  {
    model: OrderItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'sku', 'name', 'priceCents']
      }
    ]
  }
];

const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      items,
      deliveryDate: deliveryDateRaw,
      deliveryWindow,
      notes,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country
    } = req.body;

    const deliveryDate = normalizeDeliveryDateInput(deliveryDateRaw);
    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'deliveryDate must be a calendar date (YYYY-MM-DD)'
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'customerNumber']
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        active: true
      }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products are invalid or inactive'
      });
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    let totalCents = 0;
    const linePayload = [];
    for (const line of items) {
      const p = productById.get(line.productId);
      const qty = parseInt(line.quantity, 10);
      if (!p || qty < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid line item'
        });
      }
      const lineTotal = p.priceCents * qty;
      totalCents += lineTotal;
      linePayload.push({
        productId: p.id,
        quantity: qty,
        unitPriceCents: p.priceCents
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const order = await Order.create(
        {
          userId: user.id,
          customerNumber: user.customerNumber,
          status: 'pending',
          deliveryDate,
          deliveryWindow: deliveryWindow || null,
          totalCents,
          currency: 'USD',
          notes: notes || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state: state || null,
          postalCode: postalCode || null,
          country: country || 'US'
        },
        { transaction: t }
      );

      for (const line of linePayload) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents
          },
          { transaction: t }
        );
      }

      return Order.findByPk(order.id, {
        include: orderInclude,
        transaction: t
      });
    });

    const cutoffDays = getOrderDeleteCutoffDays();
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: decorateOrderForClient(result, cutoffDays),
        orderDeleteCutoffDays: cutoffDays
      }
    });
  } catch (error) {
    next(error);
  }
};

const listMyOrders = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query',
        errors: errors.array()
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    const count = await Order.count({ where });
    const rows = await Order.findAll({
      where,
      include: orderInclude,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const cutoffDays = getOrderDeleteCutoffDays();
    const orders = rows.map((row) => decorateOrderForClient(row, cutoffDays));

    res.json({
      success: true,
      data: {
        orders,
        orderDeleteCutoffDays: cutoffDays,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: count ? Math.ceil(count / limit) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: orderInclude
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const cutoffDays = getOrderDeleteCutoffDays();
    res.json({
      success: true,
      data: {
        order: decorateOrderForClient(order, cutoffDays),
        orderDeleteCutoffDays: cutoffDays
      }
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const cutoffDays = getOrderDeleteCutoffDays();
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const plain = order.get({ plain: true });
    const { allowed, reason } = evaluateOrderCancellation(plain, cutoffDays);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: reason || 'Order cannot be cancelled'
      });
    }

    await order.update({ status: 'cancelled' });
    const refreshed = await Order.findByPk(order.id, { include: orderInclude });

    res.json({
      success: true,
      message: 'Order cancelled',
      data: {
        order: decorateOrderForClient(refreshed, cutoffDays),
        orderDeleteCutoffDays: cutoffDays
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  listMyOrders,
  getOrderById,
  cancelOrder
};

const { Product } = require('../models');

const listActive = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'sku', 'name', 'description', 'priceCents', 'active']
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listActive
};

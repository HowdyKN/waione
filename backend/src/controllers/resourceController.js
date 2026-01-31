const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Generic CRUD controller - can be extended for specific resources
// This is a template that can be used for any resource

const createResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const Model = req.model; // Model should be set by route middleware
    const data = req.body;
    data.userId = req.user.id; // Associate with current user

    const resource = await Model.create(data);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

const getResources = async (req, res, next) => {
  try {
    const Model = req.model;
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.id
    };

    // Add search functionality if search field is defined
    if (search && req.searchFields) {
      where[Op.or] = req.searchFields.map(field => ({
        [field]: { [Op.iLike]: `%${search}%` }
      }));
    }

    const { count, rows } = await Model.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        resources: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const Model = req.model;
    const { id } = req.params;

    const resource = await Model.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const Model = req.model;
    const { id } = req.params;

    const resource = await Model.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.update(req.body);

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const Model = req.model;
    const { id } = req.params;

    const resource = await Model.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Use soft delete if model supports it, otherwise hard delete
    if (resource.destroy) {
      await resource.destroy();
    } else {
      await Model.destroy({ where: { id } });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
};











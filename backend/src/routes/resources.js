const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');
const { body, param } = require('express-validator');

const router = express.Router();

// Middleware to set model (this is a template - replace with actual models)
// Example: router.use('/example', setModel(ExampleModel), ...)
const setModel = (Model, searchFields = []) => {
  return (req, res, next) => {
    req.model = Model;
    req.searchFields = searchFields;
    next();
  };
};

// Generic validation (can be customized per resource)
const createValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim()
];

const updateValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid resource ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim()
];

const idValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid resource ID')
];

// All routes require authentication
router.use(authenticateToken);

// Example resource routes (template - replace with actual resources)
// GET /api/resources - List all resources
router.get('/', resourceController.getResources);

// GET /api/resources/:id - Get single resource
router.get('/:id', idValidator, resourceController.getResourceById);

// POST /api/resources - Create resource
router.post('/', createValidator, resourceController.createResource);

// PUT /api/resources/:id - Update resource
router.put('/:id', updateValidator, resourceController.updateResource);

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', idValidator, resourceController.deleteResource);

module.exports = router;
module.exports.setModel = setModel; // Export for use in specific resource routes











const express = require('express');
const { body, query, validationResult, param } = require('express-validator');
const upload = require('../middleware/upload');
const { createLostItem, getAllLostItems, getLostItemById } = require('../controllers/lostItemController');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post(
  '/',
  (req, res, next) => {
    console.log('📩 Incoming POST /lost-items request');
    next();
  },
  upload.single('image'),
  body('itemName').trim().notEmpty().withMessage('itemName is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('location').trim().notEmpty().withMessage('location is required'),
  body('date').isISO8601().toDate().withMessage('date must be ISO8601'),
  validate,
  createLostItem
);

router.get(
  '/',
  // Optional pagination/filter/sort
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString(),
  query('location').optional().isString(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('sort').optional().isIn(['-createdAt', 'createdAt', 'date', '-date']),
  validate,
  getAllLostItems
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid id'),
  validate,
  getLostItemById
);

module.exports = router;

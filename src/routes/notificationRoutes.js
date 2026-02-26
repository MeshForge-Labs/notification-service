const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createNotificationValidation = [
  body('userId').notEmpty().withMessage('userId is required').trim(),
  body('eventId').notEmpty().withMessage('eventId is required').trim(),
  body('bookingId').notEmpty().withMessage('bookingId is required').trim(),
  body('quantity').notEmpty().withMessage('quantity is required').isInt({ min: 1 }).withMessage('quantity must be at least 1').toInt(),
];

router.post('/', createNotificationValidation, validate, notificationController.createNotification);

module.exports = router;

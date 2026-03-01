const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createNotificationValidation = [
  body('bookingId').notEmpty().withMessage('bookingId is required').trim(),
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('email must be a valid email address').normalizeEmail(),
  body('eventId').optional().trim(),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
];

router.post('/', createNotificationValidation, validate, notificationController.createNotification);

module.exports = router;

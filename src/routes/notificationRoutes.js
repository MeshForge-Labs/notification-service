const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createNotificationValidation = [
  body('type')
    .optional()
    .isIn(['BOOKING_CONFIRMED', 'BOOKING_CANCELLED'])
    .withMessage('type must be BOOKING_CONFIRMED or BOOKING_CANCELLED'),
  body('bookingId').notEmpty().withMessage('bookingId is required').trim(),
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('email must be a valid email address').normalizeEmail(),
  body('eventId').optional().trim(),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
];

const testNotificationValidation = [
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('email must be a valid email address').normalizeEmail(),
  body('subject').optional().isString().withMessage('subject must be a string').trim(),
  body('text').optional().isString().withMessage('text must be a string').trim(),
  body('html').optional().isString().withMessage('html must be a string').trim(),
];

router.post('/', createNotificationValidation, validate, notificationController.createNotification);
router.post('/test', testNotificationValidation, validate, notificationController.sendTestNotification);

module.exports = router;
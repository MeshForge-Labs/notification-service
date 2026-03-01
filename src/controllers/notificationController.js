const emailService = require('../services/emailService');
const logger = require('../utils/logger');

async function createNotification(req, res, next) {
  try {
    const { bookingId, email, eventId, quantity } = req.body;
    const result = await emailService.sendBookingNotification({ bookingId, email, eventId, quantity });
    res.status(200).json({
      message: 'Notification sent',
      bookingId,
      status: result.mock ? 'logged' : 'sent',
    });
  } catch (err) {
    logger.error('createNotification failed', { error: err.message });
    next(err);
  }
}

module.exports = { createNotification };

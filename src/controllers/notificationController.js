const emailService = require('../services/emailService');
const logger = require('../utils/logger');

async function createNotification(req, res, next) {
  try {
    const booking = req.body;
    const result = await emailService.sendBookingNotification(booking);
    res.status(202).json({
      message: 'Notification accepted',
      bookingId: booking.bookingId,
      status: result.mock ? 'logged' : 'sent',
    });
  } catch (err) {
    logger.error('createNotification failed', { error: err.message });
    next(err);
  }
}

module.exports = { createNotification };

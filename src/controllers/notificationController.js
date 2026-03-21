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

async function sendTestNotification(req, res, next) {
  try {
    const { email, subject, text, html } = req.body;
    const result = await emailService.sendTestNotification({ email, subject, text, html });
    res.status(200).json({
      message: 'Test notification sent',
      email,
      status: result.mock ? 'logged' : 'sent',
    });
  } catch (err) {
    logger.error('sendTestNotification failed', { error: err.message });
    next(err);
  }
}

module.exports = { createNotification, sendTestNotification };

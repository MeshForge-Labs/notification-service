const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (config.email.mock) return null;
  const { smtp } = config.email;
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
  return transporter;
}

function buildBookingEmail(booking) {
  const { email, eventId, bookingId, quantity } = booking;
  return {
    subject: `Booking confirmed – ${bookingId}`,
    text: `Your booking has been confirmed.\n\nBooking ID: ${bookingId}\nEmail: ${email}\nEvent ID: ${eventId}\nSeats: ${quantity}\n\nThank you.`,
    html: `
      <p>Your booking has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Event ID:</strong> ${eventId}</li>
        <li><strong>Seats:</strong> ${quantity}</li>
      </ul>
      <p>Thank you.</p>
    `,
  };
}

async function sendBookingNotification(booking) {
  const { email, eventId, bookingId, quantity } = booking;
  const payload = { email, eventId, bookingId, quantity };

  if (config.email.mock) {
    logger.info('Notification sent (mock)', { bookingId, email, eventId, quantity });
    return { success: true, mock: true };
  }

  const transport = getTransporter();
  if (!transport) {
    logger.warn('No SMTP configured, logging only', { bookingId });
    logger.info('Notification payload (no email)', payload);
    return { success: true, mock: true };
  }

  const { smtp } = config.email;
  const { subject, text, html } = buildBookingEmail(booking);

  try {
    await transport.sendMail({
      from: smtp.from,
      to: email,
      subject,
      text,
      html,
    });
    logger.info('Notification sent (email)', { bookingId, email, eventId, quantity });
    return { success: true, mock: false };
  } catch (err) {
    logger.error('Email send failed', { bookingId, error: err.message });
    throw err;
  }
}

module.exports = { sendBookingNotification };

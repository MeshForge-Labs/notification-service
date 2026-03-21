const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter = null;
let azureClient = null;

function getTransporter() {
  if (transporter) return transporter;
  if (config.email.provider !== 'smtp') return null;
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

function getAzureClient() {
  if (azureClient) return azureClient;
  if (config.email.provider !== 'azure') return null;
  // Lazy load so SMTP-only mode does not require Azure package initialization.
  const { EmailClient } = require('@azure/communication-email');
  azureClient = new EmailClient(config.email.azure.connectionString);
  return azureClient;
}

function buildBookingConfirmedEmail(booking) {
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

function buildBookingCancelledEmail(booking) {
  const { email, eventId, bookingId, quantity } = booking;
  return {
    subject: `Booking cancelled – ${bookingId}`,
    text: `Your booking has been cancelled.\n\nBooking ID: ${bookingId}\nEmail: ${email}\nEvent ID: ${eventId}\nSeats: ${quantity}\n\nIf this was a mistake, please create a new booking.`,
    html: `
      <p>Your booking has been cancelled.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Event ID:</strong> ${eventId}</li>
        <li><strong>Seats:</strong> ${quantity}</li>
      </ul>
      <p>If this was a mistake, please create a new booking.</p>
    `,
  };
}

function buildTestEmail(payload) {
  const { email, subject, text, html } = payload;
  const safeSubject = (subject || 'Notification service test').trim();
  const safeText = (text || 'This is a test email from notification-service.').trim();
  const safeHtml = (html || `<p>${safeText}</p>`).trim();
  return {
    to: email,
    subject: safeSubject,
    text: safeText,
    html: safeHtml,
  };
}

async function sendViaSmtp(booking, emailBody) {
  const { email, eventId, bookingId, quantity } = booking;
  const transport = getTransporter();
  if (!transport) {
    logger.warn('No SMTP configured, logging only', { bookingId });
    logger.info('Notification payload (no email)', { email, eventId, bookingId, quantity });
    return { success: true, mock: true };
  }

  const { smtp } = config.email;
  await transport.sendMail({
    from: smtp.from,
    to: emailBody.to || email,
    subject: emailBody.subject,
    text: emailBody.text,
    html: emailBody.html,
  });
  return { success: true, mock: false };
}

async function sendViaAzureApi(booking, emailBody) {
  const client = getAzureClient();
  if (!client) {
    logger.warn('No Azure Email API configured, logging only', { bookingId: booking.bookingId });
    return { success: true, mock: true };
  }

  const poller = await client.beginSend({
    senderAddress: config.email.azure.sender,
    content: {
      subject: emailBody.subject,
      plainText: emailBody.text,
      html: emailBody.html,
    },
    recipients: {
      to: [{ address: emailBody.to || booking.email }],
    },
  });
  const result = await poller.pollUntilDone();
  if (!result || (result.status && result.status.toLowerCase() !== 'succeeded')) {
    throw new Error(`Azure Email send failed with status: ${result ? result.status : 'unknown'}`);
  }
  return { success: true, mock: false };
}

async function sendNotification(notification) {
  const { type = 'BOOKING_CONFIRMED' } = notification;
  if (type !== 'BOOKING_CONFIRMED' && type !== 'BOOKING_CANCELLED') {
    const err = new Error('Unsupported notification type');
    err.statusCode = 400;
    throw err;
  }

  const booking = notification;
  const { email, eventId, bookingId, quantity } = booking;
  const payload = { type, email, eventId, bookingId, quantity };
  const emailBody =
    type === 'BOOKING_CANCELLED' ? buildBookingCancelledEmail(booking) : buildBookingConfirmedEmail(booking);

  if (config.email.mock) {
    logger.info('Notification sent (mock)', { type, bookingId, email, eventId, quantity });
    return { success: true, mock: true, type };
  }

  try {
    let result;
    if (config.email.provider === 'azure') {
      result = await sendViaAzureApi(booking, emailBody);
      logger.info('Notification sent (azure)', { type, bookingId, email, eventId, quantity });
    } else {
      result = await sendViaSmtp(booking, emailBody);
      logger.info('Notification sent (email)', { type, bookingId, email, eventId, quantity });
    }
    return { ...result, type };
  } catch (err) {
    logger.error('Email send failed', { bookingId, provider: config.email.provider, error: err.message });
    logger.info('Notification payload (failed send)', payload);
    throw err;
  }
}

async function sendBookingNotification(booking) {
  return sendNotification({ ...booking, type: 'BOOKING_CONFIRMED' });
}

async function sendTestNotification(payload) {
  const emailBody = buildTestEmail(payload);
  if (config.email.mock) {
    logger.info('Test notification sent (mock)', { to: emailBody.to, subject: emailBody.subject });
    return { success: true, mock: true };
  }

  try {
    let result;
    if (config.email.provider === 'azure') {
      result = await sendViaAzureApi({ email: emailBody.to, bookingId: 'test-email' }, emailBody);
      logger.info('Test notification sent (azure)', { to: emailBody.to, subject: emailBody.subject });
    } else {
      result = await sendViaSmtp({ email: emailBody.to, bookingId: 'test-email' }, emailBody);
      logger.info('Test notification sent (email)', { to: emailBody.to, subject: emailBody.subject });
    }
    return result;
  } catch (err) {
    logger.error('Test email send failed', {
      provider: config.email.provider,
      to: emailBody.to,
      error: err.message,
    });
    throw err;
  }
}

module.exports = { sendNotification, sendBookingNotification, sendTestNotification };
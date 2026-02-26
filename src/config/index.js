require('dotenv').config();

const useMock = process.env.MOCK_EMAIL === 'true' || process.env.MOCK_EMAIL === '1';
const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

module.exports = {
  port: parseInt(process.env.PORT || '8083', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  email: {
    mock: useMock || !hasSmtp,
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
  },
};

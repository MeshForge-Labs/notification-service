require('dotenv').config();

const useMock = process.env.MOCK_EMAIL === 'true' || process.env.MOCK_EMAIL === '1';
const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const hasAzureApi = !!(process.env.ACS_EMAIL_CONNECTION_STRING && process.env.ACS_EMAIL_SENDER);

function resolveEmailProvider() {
  const requested = (process.env.EMAIL_PROVIDER || 'auto').toLowerCase();
  if (requested === 'mock') return 'mock';
  if (requested === 'smtp') return hasSmtp ? 'smtp' : 'mock';
  if (requested === 'azure') return hasAzureApi ? 'azure' : 'mock';
  if (useMock) return 'mock';
  if (hasAzureApi) return 'azure';
  if (hasSmtp) return 'smtp';
  return 'mock';
}

const provider = resolveEmailProvider();

module.exports = {
  port: parseInt(process.env.PORT || '8083', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  email: {
    provider,
    mock: provider === 'mock',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
    azure: {
      connectionString: process.env.ACS_EMAIL_CONNECTION_STRING,
      sender: process.env.ACS_EMAIL_SENDER,
    },
  },
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
// Explicit CORS policy for browser clients.
// Configure via env var: CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000" or "*".
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '*')
.split(',')
.map((s) => s.trim())
.filter(Boolean);
app.use(
cors({
origin: (origin, callback) => {
// Allow non-browser requests (no Origin header).
if (!origin) return callback(null, true);
if (allowedOrigins.includes('*')) return callback(null, true);
return callback(null, allowedOrigins.includes(origin));
},
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
credentials: false
})
);
app.use(express.json());

app.get('/health', (req, res) => {
res.status(200).json({ status: 'UP', service: 'notification-service', timestamp: new Date().toISOString() });
});

app.use('/api', routes);
app.use(errorHandler);

app.listen(config.port, () => {
logger.info('Server listening', { port: config.port, nodeEnv: config.nodeEnv, emailMode: config.email.mock ? 'mock' : 'smtp' });
});

module.exports = app;
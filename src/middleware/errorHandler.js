const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });

  const status = err.statusCode || err.status || 500;
  const message = status === 500 ? 'Internal server error' : (err.message || 'Unknown error');

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };

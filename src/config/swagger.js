module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Notification Service API',
    version: '1.0.0',
    description: 'Booking confirmation and test email notifications.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  components: {
    schemas: {
      CreateNotificationRequest: {
        type: 'object',
        required: ['bookingId', 'email'],
        properties: {
          type: { type: 'string', enum: ['BOOKING_CONFIRMED', 'BOOKING_CANCELLED'] },
          bookingId: { type: 'string' },
          email: { type: 'string', format: 'email' },
          eventId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      TestNotificationRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          subject: { type: 'string' },
          text: { type: 'string' },
          html: { type: 'string' },
        },
      },
      NotificationResult: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          bookingId: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string', enum: ['logged', 'sent'] },
        },
      },
      TestResult: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          status: { type: 'string', enum: ['logged', 'sent'] },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Liveness probe',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Service is up',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'UP' },
                    service: { type: 'string', example: 'notification-service' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications': {
      post: {
        summary: 'Send booking-related notification',
        tags: ['Notifications'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNotificationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Notification accepted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationResult' },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/notifications/test': {
      post: {
        summary: 'Send test email',
        tags: ['Notifications'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TestNotificationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Test accepted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TestResult' },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};

const express = require('express');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();
router.use('/notifications', notificationRoutes);

module.exports = router;

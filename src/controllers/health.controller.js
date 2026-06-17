const mongoose = require('mongoose');

const checkHealth = async (req, res) => {
    const dbStatus = mongoose.connection.readyState;

    const statusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };

    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        services: {
            database: statusMap[dbStatus] || 'Unknown'
        }
    };

    if (dbStatus === 1) {
        res.status(200).send(healthCheck);
    } else {
        healthCheck.message = 'Degraded';
        res.status(503).send(healthCheck);
    }
};

module.exports = {
    checkHealth,
};
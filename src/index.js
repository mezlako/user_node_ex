const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

// Connect to MongoDB and start server
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  // Start Express server
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

// Gracefully shutdown server
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Handle unexpected errors
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

// Catch uncaught exceptions (synchronous errors)
process.on('uncaughtException', unexpectedErrorHandler);

// Catch unhandled promise rejections (asynchronous errors)
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

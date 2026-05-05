const rateLimit = require('express-rate-limit');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

// Keyed on the authenticated user's id so limits are per-account, not per-IP.
// Applied inside auth() after req.user is set, so skip guards against accidental
// use on unauthenticated routes.
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.id,
  handler: (req, res, next) => {
    next(new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many requests, please try again later'));
  },
  skip: (req) => !req.user,
});

module.exports = {
  authLimiter,
  userRateLimiter,
};

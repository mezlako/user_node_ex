const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');
const { User } = require('../models');

/**
 * Resolve the current user from Authorization: Bearer <access>, matching JWT behavior in passport.
 * @param {import('express').Request} req
 * @returns {Promise<object|null>}
 */
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    if (payload.type !== tokenTypes.ACCESS) {
      return null;
    }
    const user = await User.findById(payload.sub);
    return user || null;
  } catch (e) {
    return null;
  }
};

/**
 * @param {{ req: import('express').Request }} args
 */
const createContext = async ({ req }) => ({
  user: await getUserFromRequest(req),
});

module.exports = {
  createContext,
  getUserFromRequest,
};

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email
  };

  const accessToken = jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn
  });

  const refreshToken = jwt.sign(payload, authConfig.jwt.refreshSecret, {
    expiresIn: authConfig.jwt.refreshExpiresIn
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? authConfig.jwt.refreshSecret : authConfig.jwt.secret;
  return jwt.verify(token, secret);
};

module.exports = {
  generateTokens,
  verifyToken
};











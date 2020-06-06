const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { models } = require("../db");
const secret = require("../secret").id; // Use your own secret key

/**
 * Create a jwt token out of user.id and user.role
 */
const createToken = ({ id, role }) => jwt.sign({ id, role }, secret);

/**
 * verify the jwt and find the user
 */
const getUserFromToken = (token) => {
  try {
    const user = jwt.verify(token, secret);
    return models.Users.findOne({ id: user.id });
  } catch (e) {
    return null;
  }
};

/**
 * check if the user is on the context object
 * continue to next resolver if `true`
 */
const authenticate = (next) => (root, args, context, info) => {
  if (!context.user) {
    throw new AuthenticationError("Not Authenticated");
  }
  return next(root, args, context, info);
};

/**
 * check is the user on the context has the specified role
 * continue to next resolver if `true`
 */
const authorize = (role, next) => (root, args, context, info) => {
  if (context.user.role !== role) {
    throw new AuthenticationError(`Incorrect Role: Must be an ${role}`);
  }
  return next(root, args, context, info);
};

module.exports = {
  createToken,
  getUserFromToken,
  authorize,
  authenticate,
};

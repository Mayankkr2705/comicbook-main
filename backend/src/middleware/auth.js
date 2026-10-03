import { expressjwt } from "express-jwt";
import jwks from "jwks-rsa";
import User from "../models/User.js";

// Auth0 JWT validation middleware
export const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE, // Your API identifier
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Optional middleware to check for user info
export const checkAuth = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({
      error: 'Access denied. No valid token provided.'
    });
  }
  next();
};

// Middleware to add user info to request
export const addUserInfo = (req, res, next) => {
  if (req.auth) {
    req.user = {
      id: req.auth.sub,
      ...req.auth
    };
  }
  next();
};

// Middleware to find or create user on first login
export const findOrCreateUser = async (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const userId = req.auth.sub;

    // Extract user info from Auth0 JWT
    // Auth0 typically provides: sub (user ID), email, name, nickname, etc.
    const email = req.auth.email || req.auth[`${process.env.AUTH0_AUDIENCE}/email`];
    const name = req.auth.name || req.auth.nickname || req.auth[`${process.env.AUTH0_AUDIENCE}/name`];

    // Try to find existing user
    let user = await User.findById(userId);

    if (!user) {
      // Create new user if doesn't exist
      // Generate a username from email or name
      let username = name || email?.split('@')[0] || `user_${userId.slice(-8)}`;

      // Ensure username is unique by appending numbers if needed
      let baseUsername = username;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = new User({
        _id: userId,
        username,
        email: email || undefined,
        stories: []
      });

      await user.save();
      console.log(`[Auth] Created new user: ${userId} (${username})`);
    }

    // Add user to request
    req.user = {
      id: userId,
      ...req.auth
    };

    next();
  } catch (error) {
    console.error('[Auth] Error in findOrCreateUser:', error);
    res.status(500).json({
      error: 'Failed to initialize user',
      message: error.message
    });
  }
};
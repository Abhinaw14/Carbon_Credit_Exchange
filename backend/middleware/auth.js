const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT and attach user info to req.user
 * JWT payload: { userId, username, role }
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please login first.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.'
    });
  }
};

/**
 * Middleware: Require specific role(s).
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

/**
 * Middleware: Validate carbon credit submission body.
 */
const validateCreditSubmission = (req, res, next) => {
  const { producer, metadata, documents } = req.body;

  if (!producer || !ethers.isAddress(producer)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing producer wallet address'
    });
  }

  if (!metadata) {
    return res.status(400).json({
      success: false,
      error: 'Metadata is required'
    });
  }

  const { projectName, location, amount, vintage } = metadata;

  if (!projectName || !location || !vintage) {
    return res.status(400).json({
      success: false,
      error: 'metadata.projectName, metadata.location, and metadata.vintage are required'
    });
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'metadata.amount must be a positive number'
    });
  }

  if (documents && !Array.isArray(documents)) {
    return res.status(400).json({
      success: false,
      error: 'documents must be an array of strings'
    });
  }

  next();
};

module.exports = { verifyToken, requireRole, validateCreditSubmission };

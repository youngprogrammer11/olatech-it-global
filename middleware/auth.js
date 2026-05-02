// Middleware to protect admin routes
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authorised' });
};

module.exports = requireAuth;

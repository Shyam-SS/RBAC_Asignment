
const authorize = (...roles) => {
  if (Array.isArray(roles[0])) roles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized: Please log in to access this resource"
        });
    }

    console.log("User role:", req.user.role);
    
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            status: false,
            message: "Forbidden: You do not have the required permissions"
        });
    }

    next();
  };
};

module.exports = authorize;
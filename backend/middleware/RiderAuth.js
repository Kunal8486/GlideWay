
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


// Authentication Middleware
module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });
      req.user = decoded;
      next();
    });
  };


const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");

const requireAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied, no token" });
  }

  // Extract token correctly
  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await userModel.findById(payload.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;

    //Move to next middleware
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


module.exports = requireAuth;
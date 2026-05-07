const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId)
      .select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    req.user = user;
    req.userId = user._id;

    next();

  } catch (err) {

    console.error("AUTH ERROR:", err);

    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });

  }

};

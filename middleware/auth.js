const User = require("../models/User");

module.exports = async function (req, res, next) {

  try {

    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      
      return res.status(401).json({
        error: "Invalid session"
      });
    }

    req.user = user;

    next();

  } catch (err) {

    console.error("AUTH MIDDLEWARE ERROR:", err);

    return res.status(500).json({
      error: "Internal server error"
    });

  }

};

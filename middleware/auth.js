const User = require("../models/User");

module.exports = async function (req, res, next) {

  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  req.user = user;
  next();
};

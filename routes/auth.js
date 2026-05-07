const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {

  const { username, email, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "Username taken" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    passwordHash: hash
  });

  req.session.userId = user._id;

  res.json({ success: true });

});

/* LOGIN */
router.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid user" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Wrong password" });

  req.session.userId = user._id;

  res.json({ success: true });

});

/* LOGOUT */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ success: true });
  });
});

module.exports = router;

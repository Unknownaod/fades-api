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

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 🧠 Prevent session fixation (important security upgrade)
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Session error" });

      req.session.userId = user._id;

      // optional: track login time
      req.session.loggedInAt = Date.now();

      return res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
/* LOGOUT */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ success: true });
  });
});

module.exports = router;

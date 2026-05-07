const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (exists) {
      return res.status(400).json({ error: "Username or email already used" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash: hash
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   LOGOUT (CLIENT HANDLES IT)
========================= */
router.post("/logout", (req, res) => {
  // JWT = no server session to destroy
  return res.json({ success: true });
});

module.exports = router;

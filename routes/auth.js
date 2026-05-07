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

    let { username, email, password } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: "Username must be 3-20 characters"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password too short"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: new RegExp(`^${username}$`, "i") },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username or email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash
    });

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {

    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {

  try {

    let { username, password } = req.body;

    username = username?.trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing credentials"
      });
    }

    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${username}$`, "i") },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

/* =========================
   LOGOUT
========================= */
router.post("/logout", (req, res) => {

  return res.json({
    success: true
  });

});

module.exports = router;

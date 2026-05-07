const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {

  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Missing fields"
      });
    }

    const exists = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    });

    if (exists) {
      return res.status(400).json({
        error: "Username or email already used"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash: hash
    });

    req.session.regenerate(async (err) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Session error"
        });
      }

      req.session.userId = user._id;
      req.session.loggedInAt = Date.now();

      req.session.save((err) => {

        if (err) {
          console.error(err);

          return res.status(500).json({
            error: "Session save failed"
          });
        }

        return res.json({
          success: true,
          user: {
            id: user._id,
            username: user.username
          }
        });

      });

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });

  }

});

/* LOGIN */
router.post("/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Missing credentials"
      });
    }

    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    const ok = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!ok) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    req.session.regenerate((err) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Session error"
        });
      }

      req.session.userId = user._id;
      req.session.loggedInAt = Date.now();

      req.session.save((err) => {

        if (err) {
          console.error(err);

          return res.status(500).json({
            error: "Session save failed"
          });
        }

        return res.json({
          success: true,
          user: {
            id: user._id,
            username: user.username
          }
        });

      });

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });

  }

});

/* LOGOUT */
router.post("/logout", (req, res) => {

  req.session.destroy(() => {

    res.clearCookie("sid", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".fades.lol"
    });

    res.json({
      success: true
    });

  });

});

module.exports = router;

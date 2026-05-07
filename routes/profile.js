const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================
   GET CURRENT USER
========================= */
router.get("/me", auth, async (req, res) => {

  return res.json({
    success: true,
    user: req.user
  });

});

/* =========================
   UPDATE PROFILE
========================= */
router.put("/update", auth, async (req, res) => {

  try {

    const user = req.user;

    if (req.body.profile) {
      user.profile = {
        ...user.profile,
        ...req.body.profile
      };
    }

    if (req.body.settings) {
      user.settings = {
        ...user.settings,
        ...req.body.settings
      };
    }

    await user.save();

    return res.json({
      success: true,
      user
    });

  } catch (err) {

    console.error("PROFILE UPDATE ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to update profile"
    });

  }

});

module.exports = router;

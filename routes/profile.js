const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

/* GET CURRENT USER */
router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

/* UPDATE PROFILE */
router.put("/update", auth, async (req, res) => {

  const user = req.user;

  user.profile = {
    ...user.profile,
    ...req.body.profile
  };

  user.settings = {
    ...user.settings,
    ...req.body.settings
  };

  await user.save();

  res.json(user);

});

module.exports = router;

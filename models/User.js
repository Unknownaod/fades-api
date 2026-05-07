const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  passwordHash: String,

  profile: {
    identity: {
      displayName: String,
      bio: String,
      avatar: String,
      banner: String,
      location: String,
      status: String
    },

    theme: {
      accentColor: { type: String, default: "#8b5cf6" },
      backgroundImage: String,
      blur: { type: Number, default: 10 }
    },

    socials: [],
    widgets: [],
    badges: []
  },

  settings: {
    isPublic: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model("User", UserSchema);

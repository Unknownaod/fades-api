const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());

/* =========================
   CORS (Vercel frontend)
========================= */
app.use(cors({
  origin: "https://fades.lol",
  credentials: true
}));

/* =========================
   DATABASE
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

/* =========================
   SESSIONS (SERVER-SIDE)
========================= */
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),

  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API running on port", PORT);
});

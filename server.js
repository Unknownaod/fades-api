const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   TRUST PROXY
========================= */
app.set("trust proxy", 1);

/* =========================
   CORS CONFIG
========================= */
const corsOptions = {
  origin: [
    "https://fades.lol",
    "https://www.fades.lol"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

/* =========================
   CORS
========================= */
app.use(cors(corsOptions));

/* IMPORTANT */
app.options("*", cors(corsOptions));

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   DATABASE
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

/* =========================
   SESSIONS
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
    domain: ".fades.lol",
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
  console.log(`API running on port ${PORT}`);
});

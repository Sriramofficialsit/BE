const express = require("express");
const cors = require("cors");
const redis = require("redis");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

let redisClient;

(async () => {
  try {
    await connectDB();

    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });

    redisClient.on("error", (err) => console.error("Redis Client Error:", err));

    await redisClient.connect();
    console.log("Redis connected");

    app.use((req, res, next) => {
      req.redisClient = redisClient;
      next();
    });

    app.use("/api/auth", authRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();

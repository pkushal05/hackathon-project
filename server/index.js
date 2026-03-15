require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
});
app.use("/api", limiter);

// Body parsing & logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Public auth routes
app.use("/api/auth", require("./routes/auth"));

// Health check stays public for infra probes
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FleetPulse API is running",
    timestamp: new Date(),
  });
});

// Protect remaining API routes
app.use("/api", authenticateToken);

// Protected API routes
app.use("/api/buses", require("./routes/buses"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/services", require("./routes/services"));
app.use("/api/parts", require("./routes/parts"));
app.use("/api/service-parts", require("./routes/serviceParts"));
app.use("/api/forecast/maintenance", require("./routes/forecastMaintenance"));
app.use("/api/forecast/parts", require("./routes/forecastParts"));
app.use("/api", require("./routes/api"));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FleetPulse server running on port ${PORT}`);
});

module.exports = app;

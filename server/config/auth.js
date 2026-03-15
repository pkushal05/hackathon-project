const crypto = require("crypto");

let warned = false;

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (!global.__fleetpulse_runtime_jwt_secret) {
    global.__fleetpulse_runtime_jwt_secret = crypto
      .randomBytes(64)
      .toString("hex");
  }

  if (!warned) {
    warned = true;
    console.warn(
      "[AUTH] JWT_SECRET not set. Using runtime-generated secret; tokens reset on restart.",
    );
  }

  return global.__fleetpulse_runtime_jwt_secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "12h";
}

module.exports = {
  getJwtSecret,
  getJwtExpiresIn,
};

const router = require("express").Router();
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post(
  "/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ]),
  authController.register,
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  authController.login,
);

router.get("/me", authenticateToken, authController.me);

router.get(
  "/pending-users",
  authenticateToken,
  requireAdmin,
  authController.getPendingUsers,
);

router.get("/users", authenticateToken, requireAdmin, authController.getUsers);

router.patch(
  "/approve/:id",
  authenticateToken,
  requireAdmin,
  validate([param("id").isMongoId().withMessage("Valid user id is required")]),
  authController.approveUser,
);

router.patch(
  "/deny/:id",
  authenticateToken,
  requireAdmin,
  validate([param("id").isMongoId().withMessage("Valid user id is required")]),
  authController.denyUserRequest,
);

router.patch(
  "/make-admin/:id",
  authenticateToken,
  requireAdmin,
  validate([param("id").isMongoId().withMessage("Valid user id is required")]),
  authController.makeAdmin,
);

module.exports = router;

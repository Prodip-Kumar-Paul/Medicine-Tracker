const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controller/feed");
const detailValidator = require("../middleware/validator/details");
const statusValidator = require("../middleware/validator/status");

const router = express.Router();

// GET routes
router.get("/specific-date", feedController.getSpecific);

// POST routes
router.post(
  "/create-profile",
  [
    body("name").trim().notEmpty().withMessage("name can't be empty"),
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("please enter a valid email"),
    body("age").isNumeric().withMessage("please enter a valid age"),
  ],
  feedController.createProfile
);

router.post(
  "/add-medicine",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("please enter a valid Medicine name"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("please enter a valid Medicine description"),
    body("type")
      .trim()
      .notEmpty()
      .withMessage("please enter a valid Medicine type"),
  ],
  feedController.addMedicine
);

router.post(
  "/new-prescription",
  detailValidator,
  feedController.newPrescription
);

router.post("/medicine-status", statusValidator, feedController.updateStatus);

module.exports = router;

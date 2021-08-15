const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controller/feed");
const presValidator = require("../middleware/validator/presValidator");

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

router.post("/new-prescription", feedController.newPrescription);

router.post("/medicine-status", feedController.updateStatus);

module.exports = router;

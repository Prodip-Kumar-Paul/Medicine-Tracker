const mongoose = require("mongoose");
const validator = require("validator");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  try {
    const status = req.query.status;
    // console.log(status + "  " + time);
    if (
      !(status === "complete" || status === "pending" || status === "failed")
    ) {
      const error = new Error("Invalid status");
      error.statusCode = 422;
      throw error;
    }
    const userId = req.body.userId;
    if (!ObjectId.isValid(userId)) {
      const error = new Error("Invalid userId");
      error.statusCode = 422;
      throw error;
    }
    const medicineId = req.body.medicineId;
    if (!ObjectId.isValid(medicineId)) {
      const error = new Error("Invalid medicineId");
      error.statusCode = 422;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

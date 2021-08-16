const mongoose = require("mongoose");
const validator = require("validator");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!ObjectId.isValid(userId)) {
      const error = new Error("Invalid userId");
      error.statusCode = 422;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

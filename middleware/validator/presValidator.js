const validator = require("validator");

module.exports = (req, res, next) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    console.log(startDate+ "  "+endDate);
    const validStartDate = validator.isDate(startDate);
    if (!validStartDate) {
      const error = new Error("Invalid start date");
      error.statusCode = 422;
      throw error;
    }
    const validEndDate = validator.isDate(endDate);
    if (!validEndDate) {
      const error = new Error("Invalid end date");
      error.statusCode = 422;
      throw error;
    }

    if (startDate >= endDate) {
      const error = new Error("start date can't be greater");
      error.statusCode = 422;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

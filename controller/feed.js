const { validationResult } = require("express-validator");
const validator = require("validator");
const moment = require("moment");
const ObjectId = require("mongoose").Types.ObjectId;

const User = require("../model/user");
const Medicine = require("../model/medicine");
const Prescription = require("../model/prescription");

exports.createProfile = async (req, res, next) => {
  try {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const age = req.body.age;

    const userExist = await User.findOne({
      email: email,
    });

    if (userExist) {
      const error = new Error("User Exists");
      error.statusCode = 404;
      throw error;
    }
    const newUser = new User({
      name,
      email,
      age,
    });
    const user = await newUser.save();
    res.status(201).json({
      message: "user created",
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const medicineName = req.body.name.toLowerCase();
    const medcineDescription = req.body.description;
    const medicineType = req.body.type;

    const medicineExist = await Medicine.findOne({
      name: medicineName,
    });

    if (medicineExist) {
      const error = new Error("Medicine Exists");
      error.statusCode = 404;
      throw error;
    }

    const newMedicine = new Medicine({
      name: medicineName,
      description: medcineDescription,
      type: medicineType,
    });
    const medicine = await newMedicine.save();
    res.status(201).json({
      message: "Medicine added sucessfully.",
      medicine,
    });
  } catch (err) {
    next(err);
  }
};

exports.newPrescription = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!ObjectId.isValid(userId)) {
      const error = new Error("Invalid userId");
      error.statusCode = 422;
      throw error;
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      const error = new Error("user not exists.");
      error.statusCode = 422;
      throw error;
    }

    const allMedicines = [];
    const medicineList = req.body.medicines;

    for (const eachMedicine of medicineList) {
      const medicineId = eachMedicine.medicineId;
      if (!ObjectId.isValid(medicineId)) {
        const error = new Error("Invalid medicineId");
        error.statusCode = 422;
        throw error;
      }
      let medicine = await Medicine.findById(medicineId).exec();
      if (!medicine) {
        const error = new Error("medicine not exists.");
        error.statusCode = 422;
        throw error;
      }

      // console.log(eachMedicine.startDate + " " + eachMedicine.endDate);

      let date = new Date();
      date = moment(date).format("YYYY-MM-DD");

      if (eachMedicine.startDate < date) {
        const error = new Error("starting date can't be in past.");
        error.statusCode = 422;
        throw error;
      }

      if (eachMedicine.startDate > eachMedicine.endDate) {
        const error = new Error("start date can't be greter than end date");
        error.statusCode = 422;
        throw error;
      }

      medicine = {
        medicineId: eachMedicine.medicineId,
        quantity: eachMedicine.quantity,
        startDate: eachMedicine.startDate,
        endDate: eachMedicine.endDate,
        numberOfTimes: eachMedicine.numberOfTimes,
        Timings: eachMedicine.Timings,
      };
      allMedicines.push(medicine);
    }

    const newPrescription = new Prescription({
      userId,
      medicines: allMedicines,
    });
    const prescription = await newPrescription.save();

    user.prescriptionId = prescription._id;
    const updatedUser = await user.save();

    res.status(201).json({
      message: "prescription added successfully.",
      prescription,
      updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSpecific = async (req, res, next) => {
  try {
    let requestDate = req.query.date;
    if (!validator.isDate(requestDate)) {
      const error = new Error("Invalid date format");
      error.statusCode = 422;
      throw error;
    }
    requestDate = new Date(requestDate);

    /** no need to hide previous dates */
    // const currentDate = Date.now();
    // if (requestDate < currentDate) {
    //   const error = new Error("query date can't be in past");
    //   error.statusCode = 422;
    //   throw error;
    // }

    const userId = req.body.userId;
    const prescription = await User.findById(userId)
      .select("prescriptionId")
      .populate("prescriptionId");

    const medicineList = prescription.prescriptionId.medicines;
    // console.log(medicineList);
    const allMedicines = [];
    for (const eachMedicine of medicineList) {
      // console.log(eachMedicine);

      if (
        requestDate >= eachMedicine.startDate &&
        requestDate <= eachMedicine.endDate
      ) {
        // console.log("inside loop");
        const medicine = {
          medicineId: eachMedicine.medicineId,
          quantity: eachMedicine.quantity,
          timeperday: eachMedicine.numberOfTimes,
          timings: eachMedicine.Timings,
        };
        allMedicines.push(medicine);
      }
    }

    const medicinesData = [];
    await Promise.all(
      allMedicines.map(async (medId) => {
        const data = await Medicine.findById(medId.medicineId);
        medicinesData.push(data);
      })
    );

    res.status(200).json({
      message: "success",
      allMedicines,
      medicinesData,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const time = req.query.time;
    const status = req.query.status;
    console.log(status + "  " + time);
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
    const user = await User.findById(userId).exec();
    if (!user) {
      const error = new Error("user not exists.");
      error.statusCode = 422;
      throw error;
    }

    const medicineId = req.body.medicineId;
    if (!ObjectId.isValid(medicineId)) {
      const error = new Error("Invalid medicineId");
      error.statusCode = 422;
      throw error;
    }
    let medicine = await Medicine.findById(medicineId).exec();
    if (!medicine) {
      const error = new Error("medicine not exists.");
      error.statusCode = 422;
      throw error;
    }

    const prescription = await User.findById(userId)
      .select("prescriptionId")
      .populate("prescriptionId");

    const medicineList = prescription.prescriptionId.medicines;

    let found = false;
    for (const med of medicineList) {
      if (med.medicineId.toString() === medicineId.toString()) {
        // console.log("Id match");
        med.Timings.forEach((drug) => {
          if (drug.time === time) {
            found = true;
            drug.status = status;
          }
        });
        if (!found) {
          const error = new Error("Invalid time.");
          error.statusCode = 422;
          throw error;
        }
      }
    }

    prescription.prescriptionId.medicines = medicineList;
    const updatedStatus = await prescription.save();

    res.status(201).json({
      message: "success",
      updatedStatus,
    });
  } catch (err) {
    next(err);
  }
};

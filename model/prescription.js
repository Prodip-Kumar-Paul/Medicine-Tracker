const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  medicines: [
    {
      medicineId: {
        type: Schema.Types.ObjectId,
        ref: "Medicine",
        require: true,
      },
      quantity: String,
      startDate: Date,
      endDate: Date,
      numberOfTimes: Number,
      Timings: [
        {
          time: String,
          status: {
            type: String,
            default: "pending",
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Prescription", prescriptionSchema);

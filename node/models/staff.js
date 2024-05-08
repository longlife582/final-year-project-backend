const mongoose = require("mongoose");

const NewStaffSchema = new mongoose.Schema({
  name: String,
  email: String,
  sex: String,
  phoneNumber: Number,
  DoB: Date,
  address: String,
  position: String,
  nationality: String,
  SOR: String,
  LGA: String,
  Education: String,
  managerId: String,
});

const newStaff = mongoose.model("staff", NewStaffSchema);
module.exports = newStaff;

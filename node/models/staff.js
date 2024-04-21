const mongoose = require("mongoose");

const NewStaffSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, required: true },
});

const newStaff = mongoose.model("newstaff", NewStaffSchema);
module.exports = newStaff;

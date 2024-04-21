const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  fullname: String,
  sex: String,
  email_address: String,
  phone_Number: Number,
  DOB: Date,
  Address: String,
  lease_start: String,
  lease_end: String,
  nationality: String,
  SOR: String,
  LGA: String,
  rent: Number,
  managerId: String,
});
const Tentant = mongoose.model("tentant", tenantSchema);

module.exports = Tentant;

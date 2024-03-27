const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  FullName: String,
  email: String,
  contact: Number,
  password: String,
  managerId: String,
});

const users = mongoose.model("Users", userSchema);

module.exports = users;

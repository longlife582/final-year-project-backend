const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("../node/models/user");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

const Port = process.env.PORT;
const url = process.env.URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("DB connected Succesfully");
    app.listen(Port, () => {
      console.log(`Server is running on port ${Port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.post("/signup", async (req, res) => {
  const { FullName, email, contact, password } = req.body;

  try {
    if (!FullName) throw Error("Please provide your full name");
    if (!email) throw Error("Please provide your email");
    if (!contact) throw Error("Please provide your contact");
    if (!password) throw Error("Please provide your password");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Error("Email already exists. Please choose a different email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      FullName,
      email,
      contact,
      password: hashedPassword,
      managerId: uuid.v4(),
    });

    await newUser.save();
    res.status(200).json("account created");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) throw Error("Please provide your email");
    if (!password) throw Error("Please provide your password");

    const user = await User.findOne({ email });
    if (!user) {
      throw Error("User not found. Please check your email or signup.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw Error("Incorrect password or Email. Please try again.");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET, // Replace with your own secret key
      { expiresIn: "24h" } // Set token expiration time
    );

    // Send managerId, name, and JWT token in response
    res.status(200).json({
      message: "Login successful",
      managerId: user.managerId,
      name: user.FullName,
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

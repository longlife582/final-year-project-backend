const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("../node/models/user");
const tenant = require("../node/models/tenant");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const users = require("../node/models/user");
const Staff = require("../node/models/staff");
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
    const managerId = uuid.v4();

    const newUser = new User({
      FullName,
      email,
      contact,
      password: hashedPassword,
      managerId,
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
      { expiresIn: "1h" } // Set token expiration time
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

// TENANT PAGE BACKEND

app.post("/tenant", async (req, res) => {
  const {
    fullname,
    sex,
    email_address,
    phone_Number,
    DOB,
    Address,
    lease_start,
    lease_end,
    nationality,
    SOR,
    LGA,
    rent,
    managerId,
  } = req.body;

  try {
    const existingUser = await User.findOne({ managerId });
    if (!existingUser) {
      throw Error("Manager does not exist.");
    }

    const existingTenant = await tenant.findOne({ email_address });
    if (existingTenant) {
      throw Error("This tenant already exists");
    }

    const Tenant = new tenant({
      fullname,
      sex,
      email_address,
      phone_Number,
      DOB,
      Address,
      lease_start,
      lease_end,
      nationality,
      SOR,
      LGA,
      rent,
      managerId,
    });

    await Tenant.save();

    res.status(200).json("Tenant Added");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/tenants/:managerId", async (req, res) => {
  const { managerId } = req.params;

  try {
    const tenants = await tenant.find({ managerId });

    if (!tenants || tenants.length === 0) {
      return res
        .status(404)
        .json({ message: "No tenants found for this manager." });
    }

    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// tenants end

app.get("/staff/:managerId", async (req, res) => {
  const { managerId } = req.params;
  try {
    const staff = await Staff.find({ managerId });
    if (!staff || staff.length === 0) {
      return res.status(400).json({ message: "No Staff found." });
    }

    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ message: "Server down" });
  }
});

app.delete("/staff/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    // Assuming 'Staff' is your mongoose model
    const deletedStaff = await Staff.findByIdAndDelete(_id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    res.status(200).json({ message: "Staff deleted successfully." });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.post("/staff", async (req, res) => {
  const {
    name,
    email,
    sex,
    phoneNumber,
    DoB,
    address,
    position,
    nationality,
    SOR,
    LGA,
    Education,
    managerId,
  } = req.body;

  try {
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      throw new Error("Staff already exists.");
    }

    const existingManager = await User.findOne({ managerId }); // Ensure managerId is a valid ObjectId
    if (!existingManager) {
      throw new Error("Manager does not exist.");
    }

    const staff = new Staff({
      name,
      email,
      sex,
      phoneNumber,
      DoB,
      address,
      position,
      nationality,
      SOR,
      LGA,
      Education,
      managerId,
    });

    await staff.save();
    res.status(200).json("Staff added successfully.");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

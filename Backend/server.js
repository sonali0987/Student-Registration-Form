
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Student database schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

const Student = mongoose.model("Student", studentSchema);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Student Registration Backend is Running!"
  });
});

// Student registration API
app.post("/api/students/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    // Validate password
    const validPassword =
      password.length === 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[@#$!]/.test(password) &&
      /^[A-Za-z0-9@#$!]+$/.test(password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Password does not meet the requirements."
      });
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits."
      });
    }

    // Check whether email already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingStudent = await Student.findOne({
      email: normalizedEmail
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save student in MongoDB
    await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone
    });

    return res.status(201).json({
      message: "Student registered successfully!"
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    return res.status(500).json({
      message: "Server error. Please try again."
    });
  }
});

// Connect to MongoDB, then start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

startServer();

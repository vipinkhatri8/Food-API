// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const Chef = require("../models/Chef");

// const router = express.Router();

// // Register
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await Chef.create({
//       name,
//       email,
//       password: hashed
//     });

//     res.json({ message: "Chef Registered", user });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await Chef.findOne({ email });
//   if (!user) return res.status(404).json({ message: "User not found" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(401).json({ message: "Invalid password" });

//   const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "7d" });

//   res.json({ message: "Login success", token });
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. SIGN UP API
// router.post('/signup', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate OTP
//     const otp = generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Create user
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       otp,
//       otpExpires
//     });

//     await user.save();

//     // In real app, here you would send OTP via email/SMS
//     // For testing, we'll return OTP in response
//     res.json({
//       message: 'User registered successfully. OTP sent for verification.',
//       userId: user._id,
//       otp: otp // Remove this in production - only for testing
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// 1. SIGN UP API (Updated with token generation)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires
    });

    await user.save();

    // ✅ SIGNUP PE BHI TOKEN GENERATE KARO
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // In real app, here you would send OTP via email/SMS
    // For testing, we'll return OTP in response
    res.json({
      message: 'User registered successfully. OTP sent for verification.',
      userId: user._id,
      token: token, // ✅ TOKEN BHI RETURN KARO
      otp: otp // Remove this in production - only for testing
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VERIFY OTP FOR SIGNUP
router.post('/verify-signup', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. FORGOT PASSWORD - SEND OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // In real app, send OTP via email/SMS
    res.json({
      message: 'OTP sent to your email',
      otp: otp // Remove this in production
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. VERIFY OTP FOR FORGOT PASSWORD
router.post('/verify-forgot-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ 
      message: 'OTP verified successfully',
      canReset: true 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. CREATE NEW PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 7. GET PROFILE (Protected Route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Profile fetched successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. UPDATE PROFILE (Protected Route)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findById(req.user._id);
    user.name = name || user.name;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. CHANGE PASSWORD (Protected Route)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
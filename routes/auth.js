const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Chef = require("../models/Chef");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await Chef.create({
      name,
      email,
      password: hashed
    });

    res.json({ message: "Chef Registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Chef.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "7d" });

  res.json({ message: "Login success", token });
});

module.exports = router;

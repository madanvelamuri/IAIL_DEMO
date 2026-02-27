const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* ===========================
   REGISTER USER
=========================== */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          return res
            .status(400)
            .json({ message: "User already exists" });
        }

        return res.status(201).json({
          id: this.lastID,
          name,
          email,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   LOGIN USER
=========================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      // Include name + email in token
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        "secretkey",
        { expiresIn: "1d" }
      );

      return res.json({ token });
    }
  );
});

module.exports = router;
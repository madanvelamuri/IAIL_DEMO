const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// =======================
// MULTER CONFIG
// =======================
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =======================
// CREATE MISTAKE
// =======================
router.post(
  "/",
  authMiddleware,
  upload.single("screenshot"),
  (req, res) => {
    const { claim_id, employee_name, mistake_type, description } =
      req.body;

    if (!claim_id || !employee_name || !mistake_type || !description) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const screenshot = req.file ? req.file.filename : null;

    db.run(
      `INSERT INTO mistakes 
      (claim_id, employee_name, mistake_type, description, screenshot, created_at) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [
        claim_id,
        employee_name,
        mistake_type,
        description,
        screenshot,
      ],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Insert failed",
          });
        }

        res.status(201).json({
          message: "Mistake added successfully",
        });
      }
    );
  }
);

// =======================
// GET ALL MISTAKES
// =======================
router.get("/", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM mistakes ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Fetch failed",
        });
      }
      res.json(rows);
    }
  );
});

// =======================
// DELETE MISTAKE
// =======================
router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM mistakes WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Delete failed",
      });
    }

    res.json({ message: "Deleted successfully" });
  });
});

module.exports = router;
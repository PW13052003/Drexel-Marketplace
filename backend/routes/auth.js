const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/register", async (req, res) => {
  const { studentId, firstName, lastName, email, phone, password } = req.body;

  try {
    const sql = `
      INSERT INTO users (student_id, first_name, last_name, email, phone, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(sql, [studentId, firstName, lastName, email, phone, password]);

    res.status(200).json({ message: "User registered successfully!", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;

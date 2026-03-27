const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// GET all students
router.get('/', async (req, res) => {
  const sql = 'SELECT * FROM students ORDER BY created_at DESC';

  try {
    const [rows] = await promisePool.execute(sql);
    res.json({ students: rows, count: rows.length });
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET single student by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM students WHERE id = ?';

  try {
    const [rows] = await promisePool.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching student:', err.message);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST create new student
router.post('/', async (req, res) => {
  const { name, age, father_name, aadhaar_number, class: studentClass } = req.body;

  // Validation
  if (!name || !age || !father_name || !aadhaar_number || !studentClass) {
    return res.status(400).json({
      error: 'All fields are required',
      required: ['name', 'age', 'father_name', 'aadhaar_number', 'class']
    });
  }

  // Validate Aadhaar number (12 digits)
  if (!/^\d{12}$/.test(aadhaar_number)) {
    return res.status(400).json({
      error: 'Invalid Aadhaar number. Must be 12 digits.'
    });
  }

  // Validate age
  if (isNaN(age) || age < 1 || age > 100) {
    return res.status(400).json({
      error: 'Invalid age. Must be between 1 and 100.'
    });
  }

  const sql = `
    INSERT INTO students (name, age, father_name, aadhaar_number, class)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await promisePool.execute(sql, [name, age, father_name, aadhaar_number, studentClass]);

    res.status(201).json({
      message: 'Student created successfully',
      id: result.insertId,
      student: {
        id: result.insertId,
        name,
        age,
        father_name,
        aadhaar_number,
        class: studentClass
      }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Student with this Aadhaar number already exists'
      });
    }
    console.error('Error creating student:', err.message);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, father_name, aadhaar_number, class: studentClass } = req.body;

  // Validation
  if (!name || !age || !father_name || !aadhaar_number || !studentClass) {
    return res.status(400).json({
      error: 'All fields are required',
      required: ['name', 'age', 'father_name', 'aadhaar_number', 'class']
    });
  }

  // Validate Aadhaar number (12 digits)
  if (!/^\d{12}$/.test(aadhaar_number)) {
    return res.status(400).json({
      error: 'Invalid Aadhaar number. Must be 12 digits.'
    });
  }

  // Validate age
  if (isNaN(age) || age < 1 || age > 100) {
    return res.status(400).json({
      error: 'Invalid age. Must be between 1 and 100.'
    });
  }

  const sql = `
    UPDATE students
    SET name = ?, age = ?, father_name = ?, aadhaar_number = ?, class = ?
    WHERE id = ?
  `;

  try {
    const [result] = await promisePool.execute(sql, [name, age, father_name, aadhaar_number, studentClass, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student: { id: parseInt(id), name, age, father_name, aadhaar_number, class: studentClass }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Another student with this Aadhaar number already exists'
      });
    }
    console.error('Error updating student:', err.message);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';

  try {
    const [result] = await promisePool.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student deleted successfully',
      id: parseInt(id)
    });
  } catch (err) {
    console.error('Error deleting student:', err.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
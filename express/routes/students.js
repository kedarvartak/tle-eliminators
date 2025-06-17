const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.get('/', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone_number, codeforces_handle } = req.body;

        if (!name || !email || !codeforces_handle) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        const newStudent = new Student({
            name,
            email,
            phone_number,
            codeforces_handle
        });

        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 
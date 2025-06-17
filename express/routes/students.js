const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { getUserInfo, getContestHistory, getSubmissionHistory } = require('../services/codeforcesService');


router.get('/', async (req, res, next) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        next(err);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        next(err);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone_number, codeforces_handle } = req.body;

        if (!name || !email || !codeforces_handle) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        const existingStudent = await Student.findOne({ $or: [{ email }, { codeforces_handle }] });
        if (existingStudent) {
            let message = 'A student with this ';
            if (existingStudent.email === email) {
                message += 'email already exists.';
            } else {
                message += 'Codeforces handle already exists.';
            }
            return res.status(409).json({ error: message });
        }

        const newStudent = new Student({ name, email, phone_number, codeforces_handle });
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        next(err);
    }
});


router.post('/:id/sync', async (req, res, next) => {
    let student;
    try {
        student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const [cfData, contestHistory, submissionHistory] = await Promise.all([
            getUserInfo(student.codeforces_handle),
            getContestHistory(student.codeforces_handle),
            getSubmissionHistory(student.codeforces_handle)
        ]);

        student.current_rating = cfData.rating || student.current_rating || 0;
        student.max_rating = cfData.maxRating || student.max_rating || 0;
        student.contest_history = contestHistory || [];
        student.submission_history = submissionHistory || [];
        student.last_updated = new Date();
        
        const updatedStudent = await student.save();
        res.json(updatedStudent);

    } catch (err) {
        
        if (err.isAxiosError && student) {
            return res.status(400).json({ error: `Sync failed. The Codeforces handle "${student.codeforces_handle}" may be invalid.` });
        }
        
        next(err);
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
    } catch (err) {
        next(err);
    }
});


router.delete('/:id', async (req, res, next) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router; 
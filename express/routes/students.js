const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { fetchCodeforcesData } = require('../services/codeforcesService');
const { scheduleSyncAllStudents } = require('../cron/jobs');

/**
 * @route   POST /api/students/schedule-sync
 * @desc    Manually trigger the scheduler job (for testing)
 * @access  Public (for testing)
 */
router.post('/schedule-sync', (req, res) => {
    console.log('Manual schedule-sync trigger received.');
    scheduleSyncAllStudents(); 
    res.status(202).json({ message: 'Process to schedule all students for sync has been started.' });
});

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
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const newData = await fetchCodeforcesData(student.codeforces_handle);
        
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: newData },
            { new: true }
        );

        res.json(updatedStudent);
    } catch (err) {
       
        res.status(400).json({ error: err.message });
    }
});


router.put('/:id', async (req, res, next) => {
    try {
        const studentToUpdate = await Student.findById(req.params.id);
        if (!studentToUpdate) {
            return res.status(404).json({ error: 'Student not found' });
        }

        let updatePayload = { ...req.body };

        // if codeforces handle is updated and is valid we call the api 
        const newHandle = req.body.codeforces_handle;
        if (newHandle && newHandle !== studentToUpdate.codeforces_handle) {
            try {
                console.log(`Handle changed for ${studentToUpdate.name}. Fetching new data for ${newHandle}...`);
                const newData = await fetchCodeforcesData(newHandle);
                // Combine fetched data with the rest of the request body
                updatePayload = { ...updatePayload, ...newData };
            } catch (error) {
                // If the new handle is invalid, stop the update and return an error
                return res.status(400).json({ error: error.message });
            }
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true, runValidators: true }
        );

        res.json(updatedStudent);
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
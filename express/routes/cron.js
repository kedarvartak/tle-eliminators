const express = require('express');
const router = express.Router();
const CronJob = require('../models/CronJob');
const { restartCronJobs } = require('../cron/jobs');

// @route   GET /api/cron/schedules
// @desc    Get all cron job schedules
router.get('/schedules', async (req, res) => {
    try {
        const schedules = await CronJob.find();
        res.json(schedules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/cron/schedules
// @desc    Create a new cron job schedule
router.post('/schedules', async (req, res) => {
    const { name, schedule, timezone } = req.body;
    try {
        const newCronJob = new CronJob({ name, schedule, timezone });
        await newCronJob.save();
        await restartCronJobs(); 
        res.status(201).json(newCronJob);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

// @route   PUT /api/cron/schedules/:id
// @desc    Update a cron job schedule
router.put('/schedules/:id', async (req, res) => {
    try {
        const { name, schedule, timezone, isEnabled } = req.body;
        const updatedJob = await CronJob.findByIdAndUpdate(req.params.id, { name, schedule, timezone, isEnabled }, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        await restartCronJobs();
        res.json(updatedJob);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

// @route   DELETE /api/cron/schedules/:id
// @desc    Delete a cron job schedule
router.delete('/schedules/:id', async (req, res) => {
    try {
        const job = await CronJob.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        await restartCronJobs();
        res.json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 
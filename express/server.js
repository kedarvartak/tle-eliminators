const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const errorHandler = require('./middleware/errorMiddleware');
const { scheduleJobs } = require('./cron/jobs');

const app = express();
const PORT = 5001; 

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connection established successfully');
        // Schedule cron jobs to run
        scheduleJobs();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/students', require('./routes/students'));

app.get('/', (req, res) => {
    res.send('Hello from the new Express backend!');
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
}); 
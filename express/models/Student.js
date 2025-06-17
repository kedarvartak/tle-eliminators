const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone_number: {
        type: String,
        unique: true,
        sparse: true, 
        trim: true,
        validate: {
            validator: function(v) {
                return v == null || v === '' || /^\d{10}$/.test(v);
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    codeforces_handle: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    current_rating: {
        type: Number,
        default: 0
    },
    max_rating: {
        type: Number,
        default: 0
    },
    last_updated: {
        type: Date,
    },
    reminder_sent_count: {
        type: Number,
        default: 0
    },
    disable_email_reminders: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student; 
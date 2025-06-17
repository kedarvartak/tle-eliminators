const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

   // duplicate check
    if (err.code && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        let userMessage = `An account with that ${field} already exists.`;
        if (field === 'phone_number') {
            userMessage = 'That phone number is already in use.';
        }
        return res.status(409).json({ error: userMessage });
    }

    // mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ error: messages.join(' ') });
    }

    res.status(500).json({ error: 'Server Error' });
};

module.exports = errorHandler; 
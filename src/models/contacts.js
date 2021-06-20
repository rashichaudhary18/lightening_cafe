const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true,
        minlength: 3
    }
});

// we create collection
const Contact = new mongoose.model('Contact', contactSchema);

module.exports = Contact;


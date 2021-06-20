const mongoose = require("mongoose");
const validator = require("validator");

const deskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
    },
    datet: {
        type: String,
        required: true
    },
    person: {
        type: Number,
        required: true
    }
});

// we create collection
const Book = new mongoose.model('Book', deskSchema);

module.exports = Book;


const mongoose = require("mongoose");
const validator = require("validator");

const blogSchema = new mongoose.Schema({
    filename: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    somedate: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true,
    }
});

// we create collection
const Blog = new mongoose.model('Blog', blogSchema);

module.exports = Blog;

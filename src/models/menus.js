const mongoose = require("mongoose");
const validator = require("validator");

const menuSchema = new mongoose.Schema({
    img: {
        type: String,
    },
    name: {
        type: String,
    },
    amount: {
        type: String,
    },
});

// we create collection
const Menu = new mongoose.model('Menu', menuSchema);

module.exports = Menu;

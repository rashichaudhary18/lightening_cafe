const mongoose = require("mongoose");
const validator = require("validator");

const cartSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
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
const Cart = new mongoose.model('Cart', cartSchema);

module.exports = Cart;
//db.employees.find({},{rows that not to be display and remaining rows only display in output})
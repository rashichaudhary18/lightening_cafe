const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email id already presemt"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    phone: {
        type: Number,
        min: 10,
        required: true,
        unique: true
    },
    password: {
        type: String,
        min: 5,
        required: true
    },
    confirmpassword: {
        type: String,
        min: 5,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//generating token
employeeSchema.methods.generateAuthToken = async function () {
    try {
        console.log(this._id);
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}

//before data save in db
// converting password into hash
employeeSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // const passwordHash = await bcrypt.hash(password, 10);
        console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the current password is ${this.password}`);
        this.confirmpassword = await bcrypt.hash(this.password, 10); //not to show category in db 
    }

    next();
})

// we create collection
const Register = new mongoose.model('Register', employeeSchema);

module.exports = Register;
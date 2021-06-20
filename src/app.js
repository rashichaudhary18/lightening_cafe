require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
require("./db/conn");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const fs = require("fs");
const multer = require("multer");

const Blog = require("./models/blogs");
const Book = require("./models/books");
const Contact = require("./models/contacts");
const Register = require("./models/registers");
const Menu = require("./models/menus");

const port = process.env.PORT || 8000;
const session = require('express-session');
const flash = require('express-flash');

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(session({
    secret: 'secret',
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours6
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// app.use(session({ cookie: { maxAge: null } }))
app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));

//define storage for image upload
const storage = multer.diskStorage({
    //destination for file
    destination: static_path,
    //add back the extension
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

//middleware
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

//upload parameters for multer
const upload = multer({
    storage: storage,
}).single('image');


// console.log(process.env.SECRET_KEY);
app.locals.menu1 = require('./menu.json');

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/menu", (req, res) => {
    // res.render("menu");
    Menu.find({}, (err, menumenu) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('menu', { menumenu: menumenu });
            console.log(menumenu);
        }
    });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/blog", auth, (req, res) => {
    console.log(`this is cookie ${req.cookies.jwt}`);

    Blog.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('blog', { items: items, message1: '' });
            console.log(items);
        }
    });
});

app.get("/book", (req, res) => {
    res.render("book", { message: '' });
});

app.get("/contact", (req, res) => {
    res.render("contact", { success: '' });  // { message: req.flash('message') }
});

app.get("/cart", (req, res) => {
    res.render("cart");
});

app.get("/gallery", (req, res) => {
    res.render("gallery");
});

app.get("/login", (req, res) => {
    res.render("login", { message3: '' });
});

app.get("/register", (req, res) => {
    res.render("register");
});


app.get("/logout", auth, async (req, res) => {
    try {
        console.log(req.user);
        // for single logout
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !== req.token
        })
        // logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");

        console.log("Logout successfully..!!")

        await req.user.save();
        res.render("login", { message2: 'Logout successfully..!!' });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("*", (req, res) => {
    res.render("404",
        { errorcomment: "Opps page not found!!" });
});

//create a Blog a table in our database
app.post('/blog', upload, async (req, res, next) => {
    // console.log(req.file);
    const moon = new Blog({
        filename: req.file.filename,
        name: req.body.name,
        somedate: req.body.somedate,
        msg: req.body.msg,
    });

    // console.log(moon);
    moon.save()
        .then(item => {
            // res.send("item saved to database");
            res.render("blog", { message1: 'Blog inserted successfully...!!' });
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//create a Book a table in our database
app.post('/book', async (req, res) => {
    const data = new Book(req.body);
    // console.log(data);
    data.save()
        .then(item => {
            // res.send("item saved to database");
            res.render("book", { message: 'Table booked successfully...!!' });
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//create a contact in our database
app.post('/contact', async (req, res) => {
    var myData = new Contact(req.body);
    myData.save()
        .then(item => {
            //res.send("item saved to database");
            res.render("contact", { success: 'Data inserted successfully...!!' });
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//create a new user in our database
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })

            console.log("the success part" + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part " + token);

            //added cookie
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });
            // console.log(cookie);

            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");
        } else {
            res.send("password are not matching");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// check login
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        console.log(`${email} and password is ${password}`);
        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

        //added cookie
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        });

        if (isMatch) {
            res.status(201).render("index", { message3: "LogedIn Successfully...!!" });
        } else {
            res.send("password incorrect");
        }
    } catch (error) {
        res.status(400).send("Invalid login details");
    }
})


app.listen(port, () => {
    console.log(`connection is setup at ${port}`);
});
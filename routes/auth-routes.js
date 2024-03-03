require("dotenv").config();
const router = require("express").Router();
const express = require("express");
const session = require('express-session');
const path = require('path');
const User = require(path.join(__dirname, '../models/user-model'))
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const saltRounds = 10;


router.get("/login", (req, res) => {
    res.render("login", { loginDetailsInvalidMessage: "" });
})

router.post("/login", async (req, res) => {

    const emailId = req.body.useremail;
    // console.log(req);
    const userpassword = req.body.password;

    const userInfo = await User.findOne({ email: emailId });
    if (!userInfo) {
        res.render("login", { loginDetailsInvalidMessage: "Invalid email/password" });
    }
    else {
        if (await bcrypt.compare(userpassword, userInfo.password)) {
            const token = jwt.sign(
                {
                    id: userInfo.id,
                    username: userInfo.name
                },
                process.env.Jwt_Secret,
                { expiresIn: "1d" });

            //Creating cookie
            const options = {
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.status(200).cookie("token", token, options).redirect("/home");

        }
        else {
            res.render("login", { loginDetailsInvalidMessage: "Invalid email / password" });
        }
    }

})


router.get("/register", (req, res) => {
    res.render("register", { emailErrorMessage: " " });
})

router.post("/register", async (req, res) => {
    const userName = req.body.name;
    const emailId = req.body.email;
    const planeTextpassword = req.body.password;

    bcrypt.hash(planeTextpassword, saltRounds, async function (err, hash) {
        if (err) {
            console.log(err);
        }
        else {
            try {
                const response = new User({
                    name: userName,
                    email: emailId,
                    password: hash
                });

                await response.save();

                res.redirect("login");

            } catch (err) {
                if (err.code === 11000) {
                    const isUserExist = await User.findOne({ email: emailId });
                    if (isUserExist) {
                        res.render("register", { emailErrorMessage: "email already used. Please try new email" })
                    }
                }
            }
        }
    });
})


router.get("/logout", (req, res) => {
    res.cookie('token', " ", { maxAge: 1 });
    res.redirect("/login")
})

module.exports = router;
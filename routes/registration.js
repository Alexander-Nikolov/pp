var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt-nodejs');
var flash = require('req-flash');

var users = db.get("users");
router.post('/', function (req, res, next) {
    var errors = [];
    var username = req.body.username;
    var password = req.body.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    var email = req.body.email;
    var name = req.body.name;

    var nameRegexp = /^[a-zA-Z ]+$/;
    if (!nameRegexp.test(name)) {
        errors.push("invalidData");
    }

    var emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegexp.test(email)) {
        errors.push("invalidData");
    }

    if (username.length < 4 || username.length > 15) {
        errors.push("invalidData");
    }

    if (password.length < 7) {
        errors.push("invalidData");
    }

    errors = errors.slice(0, 1);
    users.find({email: email}).then(function (usersFoundWithEmail) {
        if (usersFoundWithEmail.length > 0) {
            errors.push('isEmailTaken');
        }
        users.find({username: username}).then(function (usersFoundWithUsername) {
                if (usersFoundWithUsername.length > 0) {
                    errors.push('isUsernameTaken');
                }

                if (errors.length > 0) {
                    res.json({errors: errors});
                    return;
                }

                users.insert({
                    name: name,
                    username: username,
                    email: email,
                    password: hash,
                    avatarURL: "https://rockymountainradar.com/landing/images/blank-avatar.png",
                    kills: 0,
                    deaths: 0,
                    score: 0
                }).then(function (user) {
                    allUsers = users;
                    req.session.username = user.username;
                    req.session.userId = user._id;
                    res.end();
                });

                //
                //             res.render("login", {message: 'Your registration was successful!'});
                //             var smtpTransport = nodemailer.createTransport({
                //                 service: "Gmail",
                //                 auth: {
                //                     user: "mplulev@gmail.com",
                //                     pass: ""
                //                 }
                //             });
                //             var mailOptions = {
                //                 from: "Phinal Phase  <PhinalPhaseTheGame@gmail.com>",
                //                 to: email,
                //                 subject: "Welcome to PhinalPhase! ",
                //                 html: "<img src='http://i.imgur.com/iuzDfkx.png' style='margin-bottom:30px; display:block;margin:0 auto;'></br><h1 style='font-family:impact; text-align:center; text-shadow:1px 2px 21px #FF0000'>Greetings  " + username + "! Welcome to the PHINAL PHASE!</h1>"
                //             };
                //             smtpTransport.sendMail(mailOptions, function (error, response) {
                //                 if (error) {
                //                     console.log(error);
                //                 } else {
                //                     console.log("Message sent: " + response.message);
                //                 }
                //             });
            }
        );
    })
});
module.exports = router;
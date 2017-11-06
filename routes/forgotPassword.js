var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
router.get('/', function (req, res, next) {
    res.render("forgotPassword")
});

var users = db.get("users");
router.post('/', function (req, res, next) {
    var forgotPasswordInput = req.body.lostPassEmail;
    users.find({email: forgotPasswordInput}).then(function (data1) {
        if (data1.length == 0) {
            res.render("forgotPassword", {message: "There is no such email in our database."});
        }
        else if (data1.length !== 0) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "mplulev@gmail.com",
                    pass: "rastafare321"
                }
            });
            var mailOptions = {
                from: "Phinal Phase  <PhinalPhaseTheGame@gmail.com>",
                to: forgotPasswordInput,
                subject: "PhinalPhase Password Recovery! ",
                html: "<img src='http://i.imgur.com/iuzDfkx.png' style='margin-bottom:30px; display:block;margin:0 auto;'></br><h1 style='font-family:impact; text-align:center; text-shadow:1px 2px 21px #FF0000'>Greetings  " + data1[0].username + "! Your password is :</h1>" + "<p style='font-size:20px; text-align:center; font-family:impact;'>" + data1[0].password + "</p>"
            }
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Message sent: " + response.message);
                }
            });
            res.render("login", {});
        }
    });
});
module.exports = router;
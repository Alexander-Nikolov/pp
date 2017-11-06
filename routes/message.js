var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");


var users = db.get("users");
router.post('/', function (req, res, next) {
    var messageBody = req.body.messageMail;
    var subject = req.body.subject;
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "mplulev@gmail.com",
            pass: "rastafare321"
        }
    });
    var mailOptions = {
        from: req.session.userId,
        to: "mplulev@gmail.com",
        subject: subject,
        html: "<img src='http://i.imgur.com/iuzDfkx.png' style='margin-bottom:30px; display:block;margin:0 auto;'><p> " + messageBody + "</p>"
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Message sent: " + response.message);
        }
    });
});

module.exports = router;
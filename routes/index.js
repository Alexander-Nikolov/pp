var express = require("express");
var router = express.Router();

var userInfo = require('./userInfo');
var login = require('./login');
var logout = require('./logout');
var registration = require('./registration');
var pp = require('./pp');
var forgotPassword = require('./forgotPassword');
var message = require('./message');
var userToUserMessage = require('./userToUserMessage');
var upload = require('./upload');

function requireLogin(req, res, next) {
    if (req.session.userId !== undefined) {
        next();
    } else {
        res.redirect("/login");
    }
}


router.use('/login', login);
router.use('/registration', registration);
router.use('/userInfo', userInfo);
router.use('/logout', logout);
router.use('/message', message);
router.use('/userToUserMessage', userToUserMessage);
router.use('/upload', upload);
router.use('/forgotPassword', forgotPassword);
router.use('/pp', requireLogin, pp);

module.exports = router;
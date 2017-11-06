var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

var users = db.get('users');
router.post('/', function (req, res, next) {
    allUsers = users;
    var usernameLogin = req.body.username;
    var passwordLogin = req.body.password;

    users.find({username: usernameLogin})
        .then(function (data) {
            if (data.length > 0 && bcrypt.compareSync(passwordLogin, data[0].password)) {
                req.session.username = data[0].username;
                req.session.userId = data[0]._id;
                res.json({hasSuccseeded: true});
            }
            else {
                res.json({hasSuccseeded: false});
            }
        });
});

module.exports = router;
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

router.get('/', function (req, res, next) {
    res.json(req.session.userId);
});

users = db.get("users");

router.get('/user', function (req, res, next) {
    users.find({_id: req.session.userId}, {avatarURL: 1})
        .then(function (data) {
            res.json(data);
        }).catch(function (err) {
        res.json(500, err);
    });
});

router.get('/all', function (req, res, next) {
    users.find()
        .then(function (data) {
            res.json(data);
        }).catch(function (err) {
        res.json(500, err);
    });
});

router.post('/update', function (req, res, next) {
    var currPass = req.body.currPass;
    var newPass = req.body.newPass;
    var newAvatar = req.body.newAvatar;

    var isChangingPass = false;
    var isChangingAvatar = false;

    var errors = [];

    var urlValidRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if (currPass && newPass) {
        isChangingPass = true;
        if ((currPass.length < 7 || newPass < 7) || (currPass === newPass)) {
            errors.push({message: "invalidData", isError: true});
        }
    }
    if (newAvatar) {
        isChangingAvatar = true;
        if (!urlValidRegex.test(newAvatar)) {
            errors.push({message: "invalidData", isError: true});
        }
    }

    if (errors.length == 0) {
        users.find({_id: req.session.userId}).then(function (usersArr) {
            var user = usersArr[0];
            var modInfo = [];

            if (isChangingPass) {
                if (bcrypt.compareSync(currPass, user.password)) {
                    var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(newPass, salt);
                    users.update({_id: req.session.userId}, {
                        $set: {
                            "password": hash
                        }
                    });
                    modInfo.push({message: "isPassChanged", isError: false});
                } else {
                    errors.push({message: "isCurrentPassValid", isError: true});
                }
            }

            if (isChangingAvatar) {
                users.update({_id: req.session.userId}, {
                    $set: {
                        avatarURL: newAvatar
                    }
                });
                modInfo.push({message: "isAvatarChanged", isError: false});
            }
            if (errors.length == 0) {
                res.json({messages: errors.concat(modInfo), hasSucceeded: true});
            } else {
                res.json({messages: errors.concat(modInfo), hasSucceeded: false});
            }
        });
    } else {
        res.json({errors: errors});
    }
});
module.exports = router;

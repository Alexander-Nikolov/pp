var express = require('express');
var router = express.Router();
var multer = require('multer');

var latestUpload = null;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        latestUpload = file.fieldname + '-' + req.session.username + '.jpg';
        cb(null, file.fieldname + '-' + req.session.username + '.jpg')
    }
});

var upload = multer({ storage: storage });

users = db.get("users");
router.post('/', upload.single('userAvatar'), function (req, res) {
    users.find({_id: req.session.userId}).then(function (usersArr) {
        var user = usersArr[0];
        users.update({_id: req.session.userId}, {
            $set: {
                avatarURL: 'uploads/' + latestUpload
            }
        });
        res.json({url:'uploads/' + latestUpload});
    });
});


module.exports = router;
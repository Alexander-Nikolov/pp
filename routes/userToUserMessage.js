var express = require('express');
var router = express.Router();

var users = db.get('users');
router.post('/', function (req, res, next) {
    var receiver = req.body.receiver;
    var subject = req.body.subject;
    var message = req.body.message;
    var sender = req.session.username;

    var messagesToUser = [];
    var hasSucceeded = false;
    if (subject.length == 0) {
        subject = "No subject";
    }

    if (message.trim().length === 0) {
        messagesToUser.push({message: "invalidData", isError: true});
        res.json({messages: messagesToUser, hasSucceeded: hasSucceeded});
        return;
    }

    users.find({username: receiver}).then(function (usersFound) {
        var user = usersFound[0];
        if (user) {
            users.update({username: user.username}, {
                $push: {
                    "inboxMessages": {
                        sender: sender,
                        subject: subject,
                        messageBody: message,
                        date: new Date(),
                        id: Math.floor(Math.random() * 9999)
                    }
                }
            });
            messagesToUser.push({message: "hasMessageSent", isError: false});
            hasSucceeded = true;
        } else {
            messagesToUser.push({message: "isUserExisting", isError: true});
        }
        res.json({messages: messagesToUser, hasSucceeded: hasSucceeded});
    });
});

router.post('/delete', function (req, res, next) {
    var user = req.body.user;
    var message = req.body.message;
    users.update(
        {
            'username': user.username
        },
        {
            $pull: {
                inboxMessages: {
                    subject: message.subject,
                    sender: message.sender,
                    messageBody: message.messageBody,
                    id: message.id
                }
            }
        });
    res.end();
});

module.exports = router;
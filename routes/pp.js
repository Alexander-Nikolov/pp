var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('pp', {username: req.session.username});
});
module.exports = router;
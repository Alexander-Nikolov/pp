var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var monk = require('monk');
var router = express.Router();
var nodemailer = require("nodemailer");

var uri = "mongodb://al_n:phinalphase123@phinalphase-shard-00-00-h6f3e.mongodb.net:27017,phinalphase-shard-00-01-h6f3e.mongodb.net:27017,phinalphase-shard-00-02-h6f3e.mongodb.net:27017/PhinalPhase?ssl=true&replicaSet=PhinalPhase-shard-0&authSource=admin";
MongoClient.connect(uri, function (err, database) {
    db = database;
    database.close();
});
db = monk(uri);
allUsers = db.get("users");

var app = express();

app.use(function (req, res, next) {
    req.db = db;
    next();
});

//routes
var index = require('./routes/index');

app.use(function (req, res, next) {
    req.db = db;
    next();
});

var server = require('http').Server(app);

var socket = require('./socketServer');

socket.getSocket(server);

server.listen(5000, function () {
    console.log('Listening on ' + server.address().port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(fileUpload());
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: "phinalphase1234"}));
app.use(router);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.server = server;
module.exports = app;
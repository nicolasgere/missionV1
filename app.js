var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var config = require('./config');
var _db = require('./mongoConn');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer');
var keysend = process.env.keysend || config.keysend;
var usersend = process.env.usersend || config.usersend;
var MongoStore = require('connect-mongo')(session);

// create reusable transporter object using SMTP transport

var app = module.exports = express();
app.sendgrid = require('sendgrid')(usersend, keysend);
app.db = _db;
app.use(session({
    store: new MongoStore({
        url: config.mongoDbStore || process.env.mongoDbStore,
    }),
    secret:'iletaitunechaine'
}));


app.set('views', __dirname + '/views/');
app.set('view engine', 'vash');
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var routes = require('./routes/private');
var routes1 = require('./routes/public');
var routes2 = require('./routes/connexion');
var routes3 = require('./routes/commande');


app.use('/', routes);
app.use('/', routes1);
app.use('/', routes2);
app.use('/', routes3);










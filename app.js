var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var _db = require('./mongoConn');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer');

var MongoStore = require('connect-mongo')(session);

var AWS = require('aws-sdk');
var accessKeyId =  process.env.AWS_ACCESS_KEY ;
var secretAccessKey = process.env.AWS_SECRET_KEY;
var keysend = process.env.KEYSEND ;
var usersend = process.env.USERSEND;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});


// create reusable transporter object using SMTP transport

var app = module.exports = express();
console.log(process.env);

app.sendgrid = require('sendgrid')(usersend, keysend);
app.s3 = new AWS.S3();
app.db = _db;
app.use(session({
    store: new MongoStore({
        url:  process.env.mongoDbStore,
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










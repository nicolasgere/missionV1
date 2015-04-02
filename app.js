var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var config = require('./config2');
var config = require('./config');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var multer  = require('multer');
var Mongolian = require("mongolian");
var db = new Mongolian(process.env.mongoDB || config.mongoDb);
var command = db.collection("command");
var users = db.collection("users");
var keysend = process.env.keysend || config.keysend;
var usersend = process.env.usersend || config.usersend;

var sendgrid  = require('sendgrid')(usersend, keysend);

// create reusable transporter object using SMTP transport

var app = express();
app.use(session({secret: 'unechainesecreteici', saveUninitialized: true, resave: true}));

// view engine setup



app.set('views', __dirname + '/views/');
app.set('view engine', 'vash');
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.post('/newCommand/', function(req,res){
  var data = req.body;
  console.log(req.body);
  console.log(req.params.id);
  data.id = guid();
  data.confirmationId = guid();
  data.tempid= guid();
  data.isValide = false;
  users.update(
    {username: data.chef},
    {$push:{idtemp : data.tempid}},
    function(err,rep){
    });
  command.insert(data,function(err,rep){ 
   console.log(rep);
   app.render('emailConfirm',data, function(err, html){
    var mailOptions = {
      from: 'no_reply@allochef.net', 
    to: data.email, // list of receivers
    subject: 'Confirmation commande', // Subject line
    html:  html// html body
  };
  sendgrid.send(mailOptions, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
    res.redirect('/');
  });
});
 });
});


app.get('/confirme/:id', function(req,res){
  var data = req.params.id;
  command.findOne({confirmationId:data},function(err,rep){
    command.update({confirmationId:data},{$set:{isValide:true, confirmationId:"confirmer"}},function(err,rep3){
      if(rep){
        users.findOne({username:rep.chef}, function(err,rep2){
            var data1 = {};
            data1.user = rep2;
            data1.mail = rep;
            console.log(data1);
            app.render('emailCommand',data1, function(err, html){
              console.log(err);
              console.log(html);
              var mailOptions2 = {
                from: 'no_reply@allochef.net',
              replyto:rep.email, // sender address
              to: rep2.email, // list of receivers
              subject: 'Nouvelle commande', // Subject line
              html:  html// html body
            };
            sendgrid.send(mailOptions2, function(err, json) {
              if (err) { return console.error(err); }
              console.log(json);
              var nbreCommande = rep2.nbrecomm?rep2.nbrecomm++ : 1;
              users.update(
                {username: rep2.username},
                {$set: {nbrecomm : nbreCommande}},
                function(err,rep){
                  res.render("confirm",{});
                });           
            });

          });

           });
      }else{
       res.render("confirm",{});
     }
   });
})
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  };
})();


module.exports = app;

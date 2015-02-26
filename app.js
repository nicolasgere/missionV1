var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var Mongolian = require("mongolian");
var db = new Mongolian("mongodb://nicolasgere:090790tfc@ds062097.mongolab.com:62097/allochef");
var command = db.collection("command");
var users = db.collection("users");


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'nicolas.gerelm@gmail.com',
    pass: 'transit90'
  }
});
// create reusable transporter object using SMTP transport

var app = express();
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));


// view engine setup
app.use(multer({ dest: './public/imgProfil',
 rename: function (fieldname, filename) {
  return filename+Date.now();
},
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));


app.set('views', __dirname + '/views/');
app.set('view engine', 'vash');
//app.engine('vash', require('vash').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.post('/newCommand', function(req,res){
  var data = req.body;
  data.id = guid();
  data.confirmationId = guid();
  data.isValide = false;
  command.insert(data,function(err,rep){
   console.log(rep);
   app.render('emailConfirm',data, function(err, html){
    var mailOptions = {
    from: '<nicolas.gerelm@gmail.com>', 
    to: data.email, // list of receivers
    subject: 'Confirmation commande', // Subject line
    html:  html// html body
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
    }else{
      console.log('Message sent: ' + info.response);
      res.redirect('/');
    }
  });
});
 });
});

app.get('/confirme/:id', function(req,res){
  var data = req.params.id;
  console.log(req.params);
  command.findOne({confirmationId:data},function(err,rep){
  command.update({confirmationId:data},{$set:{isValide:true, confirmationId:"confirmer"}},function(err,rep3){

    if(rep){
      users.findOne({username:rep.chef}, function(err,rep2){
        if(rep2){
       
  app.render('emailCommand',data, function(err, html){
    console.log(rep2); 
     var mailOptions2 = {
    from: '<nicolas.gerelm@gmail.com>',
    replyTo:rep.email, // sender address
    to: rep2.email, // list of receivers
    subject: 'Nouvelle commande', // Subject line
    html:  html// html body
  };
    transporter.sendMail(mailOptions2, function(error, info){
      if(error){
        console.log(error);
      }else{
        console.log('Message sent: ' + info.response);
      }
    });
  });
  res.render("confirm",{});}
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

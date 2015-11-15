/**INCLUDE**/
var config = require('../config');
var app = require('../app');
var _db = app.db;
var func = require('../function')
var express = require('express');
var router = express.Router();

/**CUSTOM**/
var users = _db.users;


/**LOGIN**/
router.get('/login', function(req,res){
  if(req.session.connect !=true){
   res.render('login',{});
 }else{
   res.redirect('/');
 }
})

router.post('/login', function(req,res){
  users.findOne({email:req.body.email, key:req.body.key} , function(err,rep) {
   if(err) {
    res.status(500);
  } else {
    if(!rep)
    {
     res.render('login',{valide:false});
   }
   else
   {
     req.session.connect = true;
     req.session.nom = rep.nom;
     req.session.prenom = rep.prenom;
     req.session.ville = rep.ville;
     req.session.arron = rep.arron;
     req.session.email = rep.email;
     req.session.username = rep.username;
     console.log(rep);
     req.session.UserId = rep.UserId;
     res.redirect('/');
   }
 }
});
});

router.get('/Disconnect', function(req,res){
  req.session.connect = false;
  req.session.nom = "";
  req.session.prenom = "";
  req.session.username = "";

  res.redirect('/');
});

/**SIGN IN**/
router.get('/signup', function (req,res){
  console.log("JE SUIC ICI ");
  if(req.session.connect !=true){
    res.render('signup',{});
  }else{
    res.redirect('/');
  }
});
router.post('/signup',function (req,res){
  var Id = func.guid();
  req.body.UserId = Id;
  req.body.nbrCommande = 0;
  req.body.comments = [];
  req.body.imageSrc = "e6e464ed-5893-0d28-8c41-67eb2cc892ef.jpeg";
  console.log( req.body);
  var user = new users(req.body);
  user.save( function(err,rep) {
    if(err) {
      console.log(err);
      res.status(500);
    } else {
      if(!rep)
      {
        res.status(204);
      }
      else
      {
        console.log(rep);
        req.session.connect = true;
        req.session.nom = user.nom;
        req.session.prenom = user.prenom;
        req.session.email = user.email;
        req.session.username = user.username;
        req.session.UserId = user.UserId;
        res.status(300);
        res.redirect('/');
      }
    }
  });
}); 
router.post('/valideUsername', function (req,res){
  console.log(req.body.username)
  users.findOne({username:req.body.username},function(err,rep){
    if(rep){
      res.send(false);
    }else{
      res.send(true);
    }
  })
})




/**Change password**/

router.post('/changePwd',function(req,res){
  users.update({username:req.session.username}, {$set:{key:req.body.pwd}},function(err,rep){
    console.log(rep);
    console.log(req.body.pwd);
    res.send(200).end();
  })
});
router.post ('/forgotpwd', function(req,res){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 5; i++ ){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  users.update({email:req.body.email},{$set:{key:text}},function(err,rep){
    if(rep){
      console.log(app);
     app.render('emailPwd',{pwd:text}, function(err, html){
      console.log(html);
      var mailOptions = {
        from: 'no_reply@allochef.net', 
    to: req.body.email, // list of receivers
    subject: 'Reinitialisation de votre mot de passe', // Subject line
    html:  html// html body
  };
  app.sendgrid.send(mailOptions, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
  });
   }
   res.status(200).end()
 });
});

module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/

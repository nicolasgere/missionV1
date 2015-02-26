/**INCLUDE**/
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var Validator = require('jsonschema').Validator;
var v = new Validator();
var Mongolian = require("mongolian");
var db = new Mongolian("mongodb://nicolasgere:090790tfc@ds062097.mongolab.com:62097/allochef");
var users = db.collection("users");
var meals = db.collection("meals");
var vash = require('vash');


function isConnect (req,res, next){
  if(req.session.connect ==true){
   return next();
   console.log("je suis connecter c est ok");
 }
 res.redirect('/login');

}
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


/**INDEX**/
router.get('/', function(req,res){
  console.log(req.session.nom);
  if(req.session.connect ==true){
   res.render('index.vash',{username:req.session.username});
 }
 else{
   res.render('index.vash');
 }
});

/**LOGIN**/
router.get('/login', function(req,res){
  if(req.session.connect !=true){
   res.render('login',{});
 }else{
   res.redirect('/');

 }
});

router.get('/signup',function(req,res){
  res.render('signup');
}); 
router.post('/login', function(req,res){
  users.findOne({email:req.body.email, key:req.body.key} , function(err,rep) {
   if(err) {
    res.status(500);
  } else {
    if(!rep)
    {
     console.log("PAS BON LOG");
     res.status(204);
   }
   else
   {
     req.session.connect = true;
     req.session.nom = rep.nom;
     req.session.prenom = rep.prenom;
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
  res.redirect('/');
});

/**SIGN IN**/
router.get('/signup', function(req,res){
  if(req.session.connect !=true){
    res.render('signup',{});
  }else{
    res.redirect('/');
  }
});
router.post('/signup',function(req,res){
  var Id = guid();
  req.body.UserId = Id;
  req.body.imageSrc = "user.jpg";
  console.log( req.body);
  users.insert(req.body, function(err,rep) {
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
        req.session.nom = rep.nom;
        req.session.prenom = rep.prenom;
        req.session.email = rep.email;
        req.session.username = rep.userName;
        req.session.UserId = rep.UserId;
        res.status(300);
        res.redirect('/');
        res.send();

      }
    }
  });
}); 

/**PROFIL**/
router.get('/myprofil', isConnect,function(req,res){
  console.log(req.session.UserId);
  users.findOne({UserId:req.session.UserId},function(err,rep){
    res.render('myprofil', {nom:rep.nom, prenom: rep.prenom , email:rep.mail, imageSrc:rep.imageSrc, desc:rep.desc, username:rep.username});
  })
}); 
router.post('/createMeal', function(req, res){
  var data = {}
  var Id = guid();
  data.price = req.body.price;
  data.cat = req.body.cat;
  data.desc = req.body.desc;
  data.name = req.body.name;
  data.UserId = req.session.UserId;
  data.MealId = Id;
  data.username =  req.session.username; 
  data.img =  Id + "." + req.body.ext;
  console.log(req.body.ext)


  if(req.body.ext =="jpeg" || req.body.ext=="jpg"){
    console.log("je suis ici");
    var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
  }
  if(req.body.ext =="png"){
    var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");
  }

  require("fs").writeFile("public/imgPlat/"+Id+"."+req.body.ext, base64Data, 'base64', function(err) {
   meals.insert(data, function(err,rep) {
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
        res.send({img:Id+"."+req.body.ext,mealId:Id});

      }
    }
  });
 });
  
});
router.post('/loadImage', function(req, res){
 res.send(req.files.fileToUpload.name);

});

/**MEAL**/
router.get('/getMeal', isConnect,function(req,res){
  console.log(req.session.UserId);
  meals.find({UserId:req.session.UserId}).toArray(function (err, array) {
    res.send(array);
  })
}); 
router.post('/updateMeal', function(req, res){
  var data = req.body;
  meals.update(
  {UserId: req.session.UserId, MealId:data.id}, // query
  {$set:{desc:data.desc,price:data.price,name:data.name,img:data.img, category:data.cat}}, 
  function(err,rep) {
   res.send("ok");
 });
  
});
router.post('/deleteMeal', function(req,res){
  console.log(req.body.id);
  meals.remove({MealId:req.body.id, UserId:req.session.UserId} , function(err,rep) {
    if(err) {
      res.status(500);
    } else {
      if(!rep)
      {
        console.log("PAS BON LOG");
        res.status(204);
      }
      else
      {
       res.send("ok");
     }
   }
 });
});

/**SETTINGS**/
router.get('/mysettings', isConnect,function(req,res){
  console.log(req.session.UserId);
  users.findOne({UserId:req.session.UserId},function(err,rep){
    console.log(rep);
    res.render('mysettings', {nom:rep.nom, prenom: rep.prenom , email:rep.email, imageSrc:rep.imageSrc, desc:rep.desc,ville:rep.ville,arron:rep.arron,username:rep.username});
  })
}); 

router.post('/test', function(req, res){

  console.log(req.body);
  var base64Data = req.body.blob.replace(/^data:image\/jpeg;base64,/, "");
  var Id = guid();
  require("fs").writeFile("public/imgProfil/"+Id+".jpeg", base64Data, 'base64', function(err) {
   users.update(
  {UserId: req.session.UserId}, // query
  {$set:{imageSrc:Id+".jpeg"}}, 
  function(err,rep) {
   res.send(Id+".jpeg");
 });
 });
});

router.post('/updateSettings', function(req, res){
  users.update(
  {UserId: req.session.UserId}, // query
  {$set:{desc:req.body.desc, nom:req.body.nom,prenom:req.body.prenom,emai: req.body.email, ville:req.body.ville, arron: req.body.arron}}, 
  function(err,rep) {
   res.send("ok");
 });});


router.get('/search', function(req,res){
  res.render('search',{});
});

router.post('/search', function(req,res){
  if(req.body.arrayRequeste){
   var arrayRequeste = req.body.arrayRequeste;
   var dataToFind = [];

   arrayRequeste.forEach(function(item){
    dataToFind.push({ name: new RegExp(item, 'i')  });
  });
   console.log(dataToFind);
   meals.find({ $or:dataToFind }).toArray(function (err, array) {
    console.log(array);
    res.send(array);
  })
 }else{
  meals.find().toArray(function (err, array) {
    console.log(array);
    res.send(array);
  });
}});
router.get('/profil/:id', function(req,res){
  var model = {};
  console.log(req.params.id);
  meals.findOne({MealId:req.params.id},function(err,rep){
    model.meal = rep;
    users.findOne({UserId:rep.UserId},function(err,rep2){
      model.user = rep2;
      console.log(rep2);
      res.render('profil', model);
    })
  })
});


/**PAGE BLANCHE DE TEST**/
router.get('/blank', function(req,res){
  res.render('blankpage',{});
});
module.exports = router;

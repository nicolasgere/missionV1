/**INCLUDE**/
var express = require('express');
   var router = express.Router();
   var MongoClient = require('mongodb').MongoClient;
   var mongo = require('mongodb');
   var BSON = mongo.BSONPure;
   var db = require('./db.js');
   var Validator = require('jsonschema').Validator;
   var v = new Validator();
   var Mongolian = require("mongolian");
   var db = new Mongolian("mongodb://nicolasgere:090790tfc@ds062097.mongolab.com:62097/allochef");
   var users = db.collection("users");

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
 		res.render('index.vash',{nom:req.session.nom, prenom: req.session.prenom });
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

 /**LOGIN**/
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
         console.log(rep);
    res.render('myprofil', {nom:rep.nom, prenom: rep.prenom , email:rep.mail, imageSrc:rep.imageSrc, desc:rep.desc});
  })
 }); 
router.post('/updateImage', function(req, res){
  users.update(
  {UserId: req.session.UserId}, // query
  {$set:{imageSrc:req.files.fileToUpload.name}}, 
  function(err,rep) {
   res.send("ok");
  });
 });
router.post('/updateDesc', function(req, res){
  console.log(req.body.desc);
  users.update(
  {UserId: req.session.UserId}, // query
  {$set:{desc:req.body.desc}}, 
  function(err,rep) {
   res.send("ok");
  });});

/**PAGE BLANCHE DE TEST**/
router.get('/blank', function(req,res){
  res.render('blankpage',{});
 });

module.exports = router;

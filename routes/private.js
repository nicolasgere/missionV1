/**INCLUDE**/
var app = require('../app');
var _db = app.db;
var func = require('../function')
var express = require('express');
var fs = require('fs')
var router = express.Router();

/**CUSTOM**/
var users = _db.users;
var meals = _db.meals;

var s3 = app.s3;




/**PROFIL**/
router.get('/myprofil', func.isConnect,function(req,res){
  users.findOne({UserId:req.session.UserId},function(err,rep){
    if(rep.arron && rep.ville && rep.desc){
    res.render('myprofil', rep);}
    else{
      rep.manqueInfo = true;
      res.render('mysettings',rep);
    }
  })
}); 


router.post('/loadImage', function(req, res){
 res.send(req.files.fileToUpload.name);

});

/**MEAL**/
router.post('/createMeal', function(req, res){
  var data = {}
  var Id = func.guid();
  var IdImg = func.guid();
  data.price = req.body.price;
  data.cat = req.body.cat;
  data.desc = req.body.desc;
  data.name = req.body.name;
  data.name = req.body.name;
  data.ville = req.session.ville;
  data.arron = req.session.arron;
  data.UserId = req.session.UserId;
  data.MealId = Id;
  data.username =  req.session.username; 
  var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
  var Id = func.guid();
  var buf = new Buffer(base64Data, 'base64'); 
  s3.putObject({
    Bucket: 'allochef',
    Key: IdImg+".jpg",
    Body: buf,
    ACL:'public-read'
  }, function (perr, pres) {
    if (perr) {
      console.log("Error uploading data: ", perr);
    } else {
      console.log("Successfully uploaded data to myBucket/myKey");
          data.img =  IdImg + ".jpg";
          var meal = new meals(data);
          meal.save( function(err,rep) {

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
            res.send({img:IdImg+".jpg",mealId:Id});
          }
        }
      });
    }
  });
});
router.get('/getMeal', func.isConnect,function(req,res){
  console.log(req.session.UserId);
  meals.find({UserId:req.session.UserId},function (err, array) {
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
router.get('/mysettings', func.isConnect,function(req,res){
  console.log(req.session.UserId);
  users.findOne({UserId:req.session.UserId},function(err,rep){
    console.log(rep);
    res.render('mysettings', {nom:rep.nom, prenom: rep.prenom , email:rep.email, imageSrc:rep.imageSrc, desc:rep.desc,ville:rep.ville,arron:rep.arron,username:rep.username});
  })
}); 

router.post('/test', function(req, res){
  var base64Data = req.body.blob.replace(/^data:image\/jpeg;base64,/, "");
  var Id = func.guid();
  var buf = new Buffer(base64Data, 'base64'); 
  s3.putObject({
    Bucket: 'allochef',
    Key: Id+'.jpeg',
    Body: buf,
    ACL:'public-read'
  }, function (perr, pres) {
    if (perr) {
      console.log("Error uploading data: ", perr);
    } else {
      console.log("Successfully uploaded data to myBucket/myKey");
      users.update(
    {UserId: req.session.UserId}, // query
    {$set:{imageSrc:Id+".jpeg"}}, 
    function(err,rep) {
      res.send(Id+".jpeg");
    });
    }
  });
});
router.post('/updateSettings', function(req, res){
  console.log(req.body);
  var conditions = { UserId: req.session.UserId };
  var update =  {desc:req.body.desc, nom:req.body.nom,prenom:req.body.prenom,email: req.body.email, ville:req.body.ville, arron: req.body.arron};
  var options = { multi: false };

users.findOneAndUpdate(conditions, update, options, function(err,rep) {
    console.log(rep);
   res.send("ok");
  });  
});




router.get('/profil/:id', function(req,res){
  var model = {};
  console.log(req.params.id);

  meals.findOne({MealId:req.params.id},function(err,rep){
    model.meal = rep;
    users.findOne({UserId:rep.UserId},function(err,rep2){
      model.user = rep2;
      model.etoile1=parseInt(rep2.note)>=1?"fa fa-star" : "fa fa-star-o";
      model.etoile2=parseInt(rep2.note)>=2?"fa fa-star" : "fa fa-star-o";
      model.etoile3=parseInt(rep2.note)>=3?"fa fa-star" : "fa fa-star-o";
      model.etoile4=parseInt(rep2.note)>=4?"fa fa-star" : "fa fa-star-o";
      model.etoile5=parseInt(rep2.note)>=5?"fa fa-star" : "fa fa-star-o";
      switch(rep2.note){
        case 0.5: model.etoile1 = "fa fa-star-half-o";
          break;
        case 1.5: model.etoile2 = "fa fa-star-half-o";
          break;
        case 2.5: model.etoile3 = "fa fa-star-half-o";
          break;
        case 3.5: model.etoile4 = "fa fa-star-half-o";
          break;
        case 4.5: model.etoile5 = "fa fa-star-half-o";
          break;
      }
      console.log(rep2);
      res.render('profil', model);
    })
  })
});





module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/

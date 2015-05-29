/**INCLUDE**/
var config = require('../config');
var app = require('../app');
var _db = app.db;
var func = require('../function')
var express = require('express');
var fs = require('fs')
var router = express.Router();

/**CUSTOM**/
var users = _db.users;
var meals = _db.meals;
var AWS = require('aws-sdk');
var accessKeyId =  process.env.AWS_ACCESS_KEY ||config.accessKeyId;
var secretAccessKey = process.env.AWS_SECRET_KEY || config.secretAccessKey;
AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});
var s3 = new AWS.S3();




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
            res.send({img:IdImg+".jpg",mealId:Id});
          }
        }
      });
    }
  });
});
router.get('/getMeal', func.isConnect,function(req,res){
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
  users.update(
  {UserId: req.session.UserId}, // query  
  {$set:{desc:req.body.desc, nom:req.body.nom,prenom:req.body.prenom,email: req.body.email, ville:req.body.ville, arron: req.body.arron}}, 
  function(err,rep) {
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
router.get('/chef/:username', function(req,res){
  var model = {};
  model.username = req.session.username;

    users.findOne({username:req.params.username},function(err,rep2){
      if(rep2){
      model.user = rep2;
      console.log(rep2);
      meals.find({UserId:rep2.UserId}).toArray(function (err, array){
        model.meals = array;
        console.log(model);
        res.render('chef',model);
      });
    }else{
       res.redirect('/');
    }
    });
});

/**NOTE CHEF**/
router.get('/note/:id', function(req, res){
  var model = {};
  model.username = req.session.username;

  users.findOne({idtemp:req.params.id},function(err,rep){
    model.user = rep;
    res.render('note', model);
  });
});

router.post('/note/:id', function(req, res){
  var nourriture, service, moyenne, comment, author, commentaire;
  comment = req.body.comment?req.body.comment : 0;
  author = req.body.name?req.body.name : "Anonyme";
  nourriture = req.body.nourriture?req.body.nourriture : 0;
  service = req.body.service?   req.body.service : 0;
  moyenne = (parseInt(nourriture)+parseInt(service))/2;
  if(comment!=0){
    commentaire = {
      author: author,
      comment: comment,
      date: new Date()
    };
  }

  users.findOne({idtemp:req.params.id},function(err,rep){
    var noteFinale, nbreVote;
    if(rep.nbrenote){
      noteFinale=(parseInt(rep.note)*parseInt(rep.nbrenote)+(moyenne))/(parseInt(rep.nbrenote)+1);
      nbreVote = parseInt(rep.nbrenote)+1;
    }else{
      noteFinale = moyenne;
      nbreVote = 1;
    }
    noteFinale=roundHalf(noteFinale);
    users.update(
    {idtemp: req.params.id},
    {$set:{note:noteFinale, nbrenote:nbreVote}},
    function(err,rep){
      users.update(
        {idtemp: req.params.id},
        {$push:{comments: commentaire}},
        function(err, rep){
          users.update(
            {idtemp: req.params.id},
            {$pull:{idtemp: req.params.id}},
            function(err, rep){
              res.redirect('/');
          });
      });
    });
  });
});


module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/

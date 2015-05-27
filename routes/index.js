/**INCLUDE**/
var config = require('../config');
//var config = require('../config2');
var express = require('express');
var fs = require('fs')
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var Validator = require('jsonschema').Validator;
var v = new Validator();
var Mongolian = require("mongolian");
var db = new Mongolian(process.env.mongoDB || config.mongoDb);
//var db = new Mongolian('localhost', 27017).db( "test" );
var users = db.collection("users");
var meals = db.collection("meals");
var vash = require('vash');
var AWS = require('aws-sdk');
var accessKeyId =  process.env.AWS_ACCESS_KEY ||config.accessKeyId;
var secretAccessKey = process.env.AWS_SECRET_KEY || config.secretAccessKey;
var geoip = require('geoip-lite');


  

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

var s3 = new AWS.S3();


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
console.log(req.connection.remoteAddress);
var geo = geoip.lookup(req.connection.remoteAddress);
  var model = {}
  model.username = req.session.username;
  meals.find({isVedette:true}).limit(3).toArray(function (err, array) {
    model.meals = array 
    console.log(array);
   res.render('index.vash',model);
 });
  })


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
router.post('/pushLike',isConnect,function(req,res){

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
  var Id = guid();
  req.body.UserId = Id;
  req.body.nbrCommande = 0;
  req.body.comments = [];
  req.body.imageSrc = "e6e464ed-5893-0d28-8c41-67eb2cc892ef.jpeg";
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
        req.session.username = rep.username;
        req.session.UserId = rep.UserId;
        res.status(300);
        res.redirect('/');
        res.send();

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

/**PROFIL**/
router.get('/myprofil', isConnect,function(req,res){
  users.findOne({UserId:req.session.UserId},function(err,rep){
    if(rep.arron && rep.ville && rep.desc){
    res.render('myprofil', rep);}
    else{
      rep.manqueInfo = true;
      res.render('mysettings',rep);
    }
  })
}); 
router.post('/createMeal', function(req, res){
  var data = {}
  var Id = guid();
  var IdImg = guid();
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
  var Id = guid();
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
  var base64Data = req.body.blob.replace(/^data:image\/jpeg;base64,/, "");
  var Id = guid();
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


router.get('/search', function(req,res){
  var model = {};
  model.username = req.session.username;

model.recherche = req.query.recherche;
model.city = req.query.city;
  res.render('search',model);
});
/**search**/
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

/**Page Comment ça marche**/
router.get('/comment-ca-marche', function(req, res){
  console.log("TEST ON EST LA BABLAJKBKJHFSK JKHK SFJHF KHJDH FKJH");
  res.render('comment-ca-marche', {});
});

/**PAGE BLANCHE DE TEST**/
router.get('/blank', function(req,res){
  res.render('blankpage',{});
});
router.post('/changePwd',function(req,res){
  users.update({username:req.session.username}, {$set:{key:req.body.pwd}},function(err,rep){
    console.log(rep);
    console.log(req.body.pwd);
    res.send(200).end();
  })
})

module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/
function roundHalf(num) {
    num = Math.round(num*2)/2;
    return num;
}

/**INCLUDE**/
var app = require('../app');
var _db = app.db;

//var config = require('../config2');
var express = require('express');
var fs = require('fs');
var func = require('../function');
var router = express.Router();
var users = _db.users;
var meals = _db.meals;

var geoip = require('geoip-lite');



/**INDEX**/
router.get('/', function (req, res) {
  console.log(req.connection.remoteAddress);
  var geo = geoip.lookup(req.connection.remoteAddress);
  var model = {}
  model.username = req.session.username;
  meals.find({ isVedette: true }).limit(3).exec(function (err, array) {
    model.meals = array
    console.log(array);
    res.render('index', model);
  });
});

/**Page Comment ça marche**/
router.get('/comment-ca-marche', function (req, res) {
  res.render('comment-ca-marche', {});
});


/**SEARCH**/
router.get('/search', function (req, res) {
  var model = {};
  model.username = req.session.username;

  model.recherche = req.query.recherche;
  model.city = req.query.city;
  res.render('search', model);
});
router.post('/search', function (req, res) {
  console.log(req.body);
  if (req.body.arrayRequeste) {
    var arrayRequeste = req.body.arrayRequeste;
    var dataToFind = [];

    arrayRequeste.forEach(function (item) {
      dataToFind.push({ name: new RegExp(item, 'i') });
    });
    var conditions ={};
    conditions.$or = dataToFind;
    if(req.body.loc[0] !=0){
      conditions.loc = {
        $near: req.body.loc,
        $maxDistance: 1
      }
    }
    meals.find(conditions, function (err, array) {
      res.send(array);
    });
  } else {
    var maxDistance = 100 /111.12 ;
    var conditions = {};
    if(req.body.loc[0] !=0){
      conditions = {
      loc: {
        $near: req.body.loc,
        $maxDistance: maxDistance
      }};
    }
    meals.find(conditions, function (err, array) {
        console.log("iici");
      res.send(array);
    });
  }
});

router.get('/chef/:username', function (req, res) {
  var model = {};
  model.username = req.session.username;

  users.findOne({ username: req.params.username }, function (err, rep2) {
    if (rep2) {
      model.user = rep2;
      console.log(rep2);
      meals.find({ UserId: rep2.UserId }, function (err, array) {
        model.meals = array;
        console.log(model);
        res.render('chef', model);
      });
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/


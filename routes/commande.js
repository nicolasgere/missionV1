/**INCLUDE**/
var app = require('../app');
var _db = app.db;
var express = require('express');
var fs = require('fs');
var Math = require('mathjs');
var func = require('../function');
var router = express.Router();

/**CUSTOM**/
var users = _db.users;
var meals = _db.meals;
var commands = _db.commands;




router.post('/newCommand/', function (req, res) {
  var data = req.body;
  console.log(req.body);
  console.log(req.params.id);
  data.id = func.guid();
  data.confirmationId = func.guid();
  data.tempid = func.guid();
  data.isValide = false;
  users.update(
    { username: data.chef },
    { $push: { idtemp: data.tempid } },
    function (err, rep) {
    });
  var command = new commands(data);
  command.save(data, function (err, rep) {
    console.log(rep);
    app.render('emailConfirm', data, function (err, html) {
      var mailOptions = {
        from: 'no_reply@allochef.net',
        to: data.email, // list of receivers
        subject: 'Confirmation commande', // Subject line
        html: html// html body
      };
      app.sendgrid.send(mailOptions, function (err, json) {
        if (err) { return console.error(err); }
        console.log(json);
        res.redirect('/');
      });
    });
  });
});

router.get('/confirme/:id', function (req, res) {
  var data = req.params.id;
  commands.findOne({ confirmationId: data }, function (err, rep) {
    commands.update({ confirmationId: data }, { $set: { isValide: true, confirmationId: "confirmer" } }, function (err, rep3) {
      if (rep) {
        users.findOne({ username: rep.chef }, function (err, rep2) {
          var data1 = {};
          data1.user = rep2;
          data1.mail = rep;
          console.log(data1);
          app.render('emailCommand', data1, function (err, html) {
            console.log(err);
            console.log(html);
            var mailOptions2 = {
              from: 'no_reply@allochef.net',
              replyto: rep.email, // sender address
              to: rep2.email, // list of receivers
              subject: 'Nouvelle commande', // Subject line
              html: html// html body
            };
            app.sendgrid.send(mailOptions2, function (err, json) {
              if (err) { return console.error(err); }
              console.log(json);
              var nbreCommande = rep2.nbrecomm ? rep2.nbrecomm++ : 1;
              users.update(
                { username: rep2.username },
                { $set: { nbrecomm: nbreCommande } },
                function (err, rep) {
                  res.render("confirm", {});
                });
            });

          });

        });
      } else {
        res.render("confirm", {});
      }
    });
  });
});

/**NOTE CHEF**/
router.get('/note/:id', function(req, res){
  var model = {};
  model.username = req.session.username;

  users.findOne({idtemp:req.params.id},function(err,rep){
    model.user = rep;
    model.user.idtemp = req.params.id;
    
    console.log(rep);
    res.render('note', model);
  });
});

router.post('/note/:id', function(req, res){
  console.log(req.params.id);
  var nourriture, service, moyenne, comment, author, commentaire;
  comment = req.body.comment?req.body.comment : 0;
  author = req.body.name?req.body.name : "Anonyme";
  nourriture = req.body.nourriture?req.body.nourriture : 0;
  moyenne = nourriture;
  if(comment!=0){
    commentaire = {
      author: author,
      comment: comment,
      date: new Date()
    };
  }

  users.findOne({idtemp:req.params.id},function(err,rep){
    var noteFinale, nbreVote;
    console.log(rep);
    if(rep.nbrenote){
      noteFinale=(parseInt(rep.note)*parseInt(rep.nbrenote)+(moyenne))/(parseInt(rep.nbrenote)+1);
      nbreVote = parseInt(rep.nbrenote)+1;
    }else{
      noteFinale = moyenne;
      nbreVote = 1;
    }
    noteFinale=Math.round(noteFinale);
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


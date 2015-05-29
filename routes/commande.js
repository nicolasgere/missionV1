/**INCLUDE**/
var config = require('../config');
var app = require('../app');
var _db = app.db;
var express = require('express');
var fs = require('fs');
var func = require('../function');
var router = express.Router();

/**CUSTOM**/
var users = _db.users;
var meals = _db.meals;
var command = _db.command;




router.post('/newCommand/', function(req,res){
  var data = req.body;
  console.log(req.body);
  console.log(req.params.id);
  data.id = func.guid();
  data.confirmationId = func.guid();
  data.tempid= func.guid();
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
  app.sendgrid.send(mailOptions, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
    res.redirect('/');
  });
});
 });
}); 

router.get('/confirme/:id', function(req,res){
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
            app.sendgrid.send(mailOptions2, function(err, json) {
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


module.exports = router;

/**fonction pour arronir un nombre à 0.5 prêt**/


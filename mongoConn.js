var mongoConnec = {}
var config = require('./config');


/*mongoConnec.command = db.collection("command");;
mongoConnec.users = db.collection("users");
mongoConnec.meals = db.collection("meals");*/


var mongoose = require('mongoose');
mongoose.connect(config.mongoDb);

mongoConnec.users = mongoose.model('users', {
  username: String,
  prenom: String,
  nom: String,
  email: String,
  desc: String,
  ville: String,
  arron: String,
  key: String,
  UserId: String,
  imageSrc: String,
  comments: [ {author: String,
      comment: String,
      date: Date
    }],
  note: Number,
  nbrenote: Number,
  idtemp: [String],
  nbrecomm: Number
});

mongoConnec.meals = mongoose.model('meals', {
  price: Number,
  cat: String,
  desc: String,
  name: String,
  ville: String,
  arron: String,
  UserId: String,
  MealId: String,
  username: String,
  img: String,
  isVedette: Boolean

});
mongoConnec.commands = mongoose.model('commands', {
  chef: String,
  email: String,
  nom: String,
  commande: String,
  id: String,
  confirmationId: String,
  tempid: String,
  isValide: Boolean
});

module.exports = mongoConnec;



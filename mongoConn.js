var mongoConnec = {};


var mongoose = require('mongoose');
mongoose.connect(process.env.mongoDB);

mongoConnec.users = mongoose.model('users', {
  username: String,
  prenom: String,
  nom: String,
  email: String,
  desc: String,
  zip:String,
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  etat:String,
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
  
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  etat:String,
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



var mongoConnec = {}
var config = require('./config');

var Mongolian = require("mongolian");
var db = new Mongolian(process.env.mongoDB || config.mongoDb);
//var db = new Mongolian('localhost', 27017).db( "test" );

mongoConnec.command = db.collection("command");;
mongoConnec.users = db.collection("users");
mongoConnec.meals = db.collection("meals");

module.exports = mongoConnec;
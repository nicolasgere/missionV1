var func = {}
func.roundHalf = function (num) {
    num = Math.round(num*2)/2;
    return num;
};
func.guid = (function() {
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
func.isConnect = function isConnect (req,res, next){
  if(req.session.connect ==true){
   return next();
   console.log("je suis connecter c est ok");
 }
 res.redirect('/login');

};

module.exports = func;

var ViewModel = function() {
	var self = this;
	self.username = ko.observable();
	self.usernameError = ko.observable(false);
	self.usernameMissing = ko.observable(false);

	self.nom = ko.observable();
	self.prenom = ko.observable();
	self.email = ko.observable();
	self.pwd = ko.observable();
	self.pwdError = ko.observable(false);
	self.pwd2 = ko.observable();
	self.emailError = ko.observable(false);
	self.nomError = ko.observable(false);
	self.prenomError = ko.observable(false);
	self.condition = ko.observable();
	self.errorCondition = ko.observable(false);

	self.username.subscribe(function (){
		$.ajax( {
		url: 'valideUsername',
		type: 'POST',
		data:{username:self.username()},
		success: function(data){
			if(data){
				self.usernameError(false);

			}else{
				self.usernameError(true);
			}
		}
	} );
	});
	self.inscrire = function(){
		if(!self.condition()){
			self.errorCondition(true);
			return;
		}else{
			self.errorCondition(false);

		}

		if(!self.nom() || self.nom()==""){
			self.nomError(true);
			return;
		}else{
			self.nomError(false);

		}

		if(!self.prenom()||self.prenom()==""){
			self.prenomError(true);
			return;
		}else{
			self.prenomError(false);
		}
		if(!validateEmail(self.email())){
			self.emailError(true);
			return;
		}else{
			self.emailError(false);

		}
		if(self.pwd() != self.pwd2() || self.pwd()==""){
			self.pwdError(true);
			return;
		}else{
			self.pwdError(false);

		}

		$('#login-form').submit();
		
		


	}

}
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 


window.onload = function(){
	ko.applyBindings(new ViewModel());
 $('#main').show();

};
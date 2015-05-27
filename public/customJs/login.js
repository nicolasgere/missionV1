
var ViewModel = function() {
	var self = this;
	self.changePwd = function(){
		if (self.email()){
			$.ajax({
				type:'post',
				url:"/forgotpwd",
				data:{email:self.email()},
				success:function(){
				self.mailOk(true);
				},
				error:function(){
					alert("ALLOCH");	
				}
			})

		}else{
			self.mailError(true);
		}
		
	};
	self.mailOk= ko.observable(false);
	self.email = ko.observable();
	self.mailError = ko.observable(false);

}
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 


window.onload = function(){
	ko.applyBindings(new ViewModel());

};
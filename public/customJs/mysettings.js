
var ViewModel = function() {
	var self = this;
	self.nom=ko.observable(nom);
	self.prenom=ko.observable(prenom);
	self.email=ko.observable(email);
	self.ville=ko.observable(ville);
	self.mdp=ko.observable();
	self.nmdp=ko.observable();
	self.nmdp2=ko.observable();
	self.zip = ko.observable(zip);
	self.arron=ko.observable(arron);
	self.desc=ko.observable(desc);
	self.newNom=ko.observable(nom);
	self.newPrenom=ko.observable(prenom);
	self.newEmail=ko.observable(email);
	self.newDesc=ko.observable(desc);
	self.newPwD = ko.observable();
	self.newPwD2 = ko.observable();
	self.newZip = ko.observable();
	self.loc = loc;
	self.etat = ko.observable(etat);
	self.editNom = ko.observable(true);
	self.editZip = ko.observable(true)
	self.editPrenom = ko.observable(true);
	self.editVille = ko.observable(true);
	self.editDesc = ko.observable(true);
	self.editEmail = ko.observable(true);
	self.successPwd = ko.observable(false);
	self.errorPwd = ko.observable(false);
	self.newZip.subscribe(function(){
	$.get("http://maps.googleapis.com/maps/api/geocode/json?address="+ self.newZip(),function(data){
		console.log(data);
		 if(data.status=="OK" && data.results[0].types[0] == "postal_code"){
	     var res = data.results[0];  
		 res.address_components.forEach(function(item){
			if(item.types.indexOf("sublocality") != -1){
				self.arron(item.short_name);
			}else if(item.types.indexOf("locality")!= -1){
				self.ville(item.short_name);
			}else if(item.types.indexOf("administrative_area_level_1")!= -1){
				self.etat(item.short_name);
			}
		 })
		 self.zip(self.newZip());	
		 self.editZip(true);
		 self.loc = [res.geometry.location.lng,res.geometry.location.lat];
		// self.ville(res.formatted_address);	
		 //console.log(self.loc);
		 }else{
			 //todo si il trouve pas
		 }
	 })	
	});
	
self.save = function(){
var dataM = {"nom":self.nom(),
		"prenom":self.prenom(),
		"email":self.email(),
		"ville":self.ville(),
		"desc":self.desc(),
		"arron":self.arron(),
		"desc": self.desc(),
		"zip": self.newZip(),
		"loc": self.loc,
		"etat":self.etat()
	}
	console.log(dataM);
	$.ajax( {
		url: 'updateSettings',
		type: 'POST',
		data:dataM,
		success: function(data){
			self.editNom(true);
			self.editPrenom(true);
			self.editVille(true);
			self.editDesc(true);
			self.editEmail(true);
			self.editArron(true);
		}
	} );
}

self.editArron = ko.observable(true);
self.changeNom = function(){
	self.editNom(false);
}
self.changeZip = function(){
	self.editZip(false);
}

self.changeMdp = function(){
	self.successPwd(false);
	self.errorPwd(false);

	if(self.nmdp() && self.nmdp2()== self.nmdp()){

$.ajax( {
		url: '/changePwd',
		type: 'POST',
		data:{pwd:self.nmdp()},
		success: function(data){
		self.successPwd(true);

		}
	} );}else{
	self.errorPwd(true);
}

}
self.test= function(){
            var img = cropper.getAvatar()
	var data = img;
	$.ajax( {
		url: 'test',
		type: 'POST',
		data:{blob:data},
		success: function(data){

       $("#imgProfil").attr('src',"https://allochef.s3.amazonaws.com/"+data);
		$('#updateModal').modal('toggle');

		}
	} );

}
self.changePrenom = function(){
	self.editPrenom(false)
}
self.changeDesc = function(){
	self.editDesc(false)
}
self.changeVille = function(){
	self.editVille(false)
}
self.changeArron = function(){
	self.editArron(false)
}
self.changeEmail = function(){
	self.editEmail(false)
}

}



window.onload = function(){
	ko.applyBindings(new ViewModel());
	$("#main").show();



};
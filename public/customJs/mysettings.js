
var ViewModel = function() {
	var self = this;
	self.nom=ko.observable(nom);
	self.prenom=ko.observable(prenom);
	self.email=ko.observable(email);
	self.ville=ko.observable(ville);
	self.arron=ko.observable(arron);
	self.desc=ko.observable(desc);
	self.newNom=ko.observable(nom);
	self.newPrenom=ko.observable(prenom);
	self.newEmail=ko.observable(email);
	self.newEVlle=ko.observable(ville);
	self.newArron=ko.observable(arron);
	self.newDesc=ko.observable(desc);
	self.editNom = ko.observable(true);
	self.editPrenom = ko.observable(true);
	self.editVille = ko.observable(true);
	self.editDesc = ko.observable(true);
	self.editEmail = ko.observable(true);

self.save = function(){
var dataM = {"nom":self.nom(),
		"prenom":self.prenom(),
		"email":self.email(),
		"ville":self.ville(),
		"desc":self.desc(),
		"arron":self.arron(),
		"desc": self.desc()
	}
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
	self.editNom(false)
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


};
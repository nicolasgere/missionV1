function meal(data,parent){
	var self = this;
	self.parent = parent;
	self.name = ko.observable(data.name);
	self.price = ko.observable(data.price);
	self.category = ko.observable(data.cat);
	self.description = ko.observable(data.desc);
	self.realImage = ko.observable(data.img);
	self.mealId = ko.observable(data.MealId);
	self.supprimer = function(){
		$.ajax( {
			url: 'meal',
			type: 'DELETE',
			data: {id:self.mealId()},
			success: function(){
				location.reload()
			}
		} );
	};
	self.modifyMeal = function(){
		self.parent.newName(self.name());
		self.parent.newPrice(self.price());
		self.parent.newCategory(self.category());
		self.parent.newDescription(self.description());
		self.parent.selectMeal(self);
		self.parent.newRealImage(self.realImage());
	}

};

var ViewModel = function() {
	var self = this;
	self.meal1=ko.observable();
	self.meal2=ko.observable();
	self.meal3=ko.observable();
	self.meal4=ko.observable();
	self.newName = ko.observable();
	self.nomImage = ko.observable();
	self.selectMeal = ko.observable();

	self.newPrice = ko.observable();
	self.newPrice.subscribe(function(){
		if(IsNumeric(self.newPrice())){

		}else{
			self.newPrice("");
		}
	});
	self.newCategory = ko.observable();
	self.newDescription = ko.observable();
	self.newImage = ko.observable();
	self.cible = ko.observable();
	self.fichier = ko.observable();
	self.newRealImage = ko.observable();
	self.tailleDesc = ko.computed(function(){
	if(self.newDescription()){
			return self.newDescription().length;}
			else {
				return 0;
			}
	});
	self.descIsModif = ko.observable(false);
	self.descModif = function (){
		self.descIsModif(true);	
	}
	self.nomImage.subscribe(function(){
		self.fichier(self.nomImage().split(".")[1]);
		if(self.fichier()!="jpg" && self.fichier()!="jpeg" && self.fichier()!="png"){
			alert("Pas bon fichier");
			self.nomImage();
		}

	});



	self.availableCat = ko.observableArray(["Entre","Plat","Dessert"]);
	
	self.changeCible = function(){
		if(!self.meal1()){
			self.cible = self.meal1;
		}else if(!self.meal2()){
			self.cible = self.meal2;
		}else if(!self.meal3()){
			self.cible = self.meal3;
		}else if(!self.meal4()){
			self.cible = self.meal4;
		}
		self.newName("");
		self.newPrice("");
		self.newCategory("");
		self.newDescription("");
		self.newImage("");
		self.newRealImage("");
	};
	self.updateMeal = function(){
		var dataM = {"name":self.newName(),
		"price":self.newPrice(),
		"cat":self.newCategory(),
		"desc":self.newDescription(),
		"img":self.newRealImage(),
		"id": self.selectMeal().mealId()
	}
	$.ajax( {
		url: 'meal',
		type: 'PUT',
		data:dataM,
		success: function(data){
			self.selectMeal().name(self.newName());
			self.selectMeal().price(self.newPrice());
			self.selectMeal().category(self.newCategory());
			self.selectMeal().description(self.newDescription());
			self.selectMeal().realImage(self.newRealImage());
			$('#updateModal').modal('toggle');
		}
	} );

}
self.createMeal = function(){
	var dataM = {"name":self.newName(),
	"price":self.newPrice(),
	"cat":self.newCategory(),
	"desc":self.newDescription(),
	"img":cropper.getAvatar(),
	"ext":self.fichier()

}
$.ajax( {
	url: 'meal',
	type: 'POST',
	data:dataM,
	success: function(data){
		dataM.img=data.img;
		dataM.MealId=data.mealId;

		self.cible(new meal(dataM));
		self.newPrice("");
		self.newCategory(null);
		self.newDescription("");
		self.newImage("");
		self.newName("");
		$('#myModal').modal('toggle');
	}
} );
};

$.ajax({
	url: 'meal',
	type: 'GET',
	success: function(data){
		if(data[0]){
			self.meal1(new meal(data[0],self));
		}
		if(data[1]){
			self.meal2(new meal(data[1],self));	
		}
		if(data[2]){
			self.meal3(new meal(data[2],self));
		}
		if(data[3]){
			self.meal4(new meal(data[3],self));
		}
	}
});
}


window.onload = function(){
	ko.applyBindings(new ViewModel());
	$("#main").show();
	
};
function IsNumeric(input)
{
    return (input - 0) == input && (''+input).trim().length > 0;
}
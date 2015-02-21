function meal(data){
var self = this;
self.name = ko.observable(data.name);
self.price = ko.observable(data.price);
self.category = ko.observable(data.cat);
self.description = ko.observable(data.desc);
self.realImage = ko.observable(data.img);
self.mealId = ko.observable(data.MealId);
self.supprimer = function(){
	$.ajax( {
			url: 'deleteMeal',
			type: 'POST',
			data: {id:self.mealId()},
			success: function(){
				location.reload()
			}
		} );
};
};

var ViewModel = function() {
	var self = this;
	self.meal1=ko.observable();
    self.meal2=ko.observable();
    self.meal3=ko.observable();
    self.meal4=ko.observable();

	self.descIsModif = ko.observable(false);
	self.descModif = function (){
		self.descIsModif(true);	
	}
	self.desc = ko.observable(desc1);
	self.descTemp = ko.observable(desc1);

	self.descEnreg = function(){
		$.ajax( {
			url: 'updateDesc',
			type: 'POST',
			data: {desc:self.descTemp()},
			success: function(){
				self.desc(self.descTemp());
				self.descIsModif(false);
			}
		} );
		
	}

	self.availableCat = ko.observableArray(["Entre","Plat","Dessert"]);
	self.newName = ko.observable();
	self.newPrice = ko.observable();
	self.newCategory = ko.observable();
    self.newDescription = ko.observable();
	self.newImage = ko.observable();
	self.cible = ko.observable();
	self.newRealImage = ko.observable();
	self.changeCible = function(cible){
    if(cible==1){
    	self.cible = self.meal1;
    }else if(cible==2){
    	self.cible = self.meal2;
    }else if(cible==3){
    	self.cible = self.meal3;
    }else if(cible==4){
    	self.cible = self.meal4;
    }
	};

    self.createMeal = function(){
    	var dataM = {"name":self.newName(),
			"price":self.newPrice(),
			"cat":self.newCategory(),
			"desc":self.newDescription(),
			"img":self.newRealImage()
		          }
    		$.ajax( {
			url: 'createMeal',
			type: 'POST',
			data:dataM,
			success: function(data){
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
			url: 'getMeal',
			type: 'GET',
			success: function(data){
				if(data[0]){
					self.meal1(new meal(data[0]));
				}
				if(data[1]){
					self.meal2(new meal(data[1]));
				}
				if(data[2]){
					self.meal3(new meal(data[2]));
				}
				if(data[3]){
					self.meal4(new meal(data[3]));
				}
			}
	});

	self.imageSrc = ko.observable();
	self.imageSrc.subscribe(function(){
		$("#imgForm").submit();
	});
	self.newImage.subscribe(function(){
	$("#imgForm2").submit();
	});

	$( '#imgForm' )
	.submit( function( e ) {
		$.ajax( {
			url: 'updateImage',
			type: 'POST',
			data: new FormData( this ),
			processData: false,
			contentType: false,
			success: function(){
				location.reload()
			}
		} );
		e.preventDefault();
	} );
	$( '#imgForm2' )
	.submit( function( e ) {
		$.ajax( {
			url: 'loadImage',
			type: 'POST',
			data: new FormData( this ),
			processData: false,
			contentType: false,
			success: function(data){
				self.newRealImage(data);
			}
		} );
		e.preventDefault();
	} );
}



window.onload = function(){
	ko.applyBindings(new ViewModel());

	
};
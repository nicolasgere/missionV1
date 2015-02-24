function meal(data,parent){
	var self = this;
	self.parent = parent;
	self.name = data.name;
	self.price = data.price;
	self.category = data.cat;
	self.description = data.desc;
	self.username = data.username;
	self.image = data.img;
	self.mealId = data.MealId;
	self.userId = data.UserId;
	self.note = 4;
	self.getClass = function(val){
		if((val-0.5)<=self.note){
		return "color-green fa fa-star";
		}else{
		return "color-green fa fa-star-o";
		}
	}

};

var ViewModel = function() {
	var self = this;
	self.recherche = ko.observable();
	self.ville = ko.observable("Montréal");

	self.arrayRecherche = ko.computed(function(){
		if(self.recherche()){
      return self.recherche().split(" ");
  };

	});
	self.allMeal = ko.observableArray();
	self.load = function(){
		if(self.arrayRecherche()){
		var dataM = {
			arrayRequeste:self.arrayRecherche().filter(function(item) {
            return item.length>3 ;
        })
		};
	}else{
var dataM = {}
		}
		self.allMeal([]);
	$.ajax( {
		url: 'search',
		type: 'POST',
		data:dataM,
		success: function(data){
			data.forEach(function(item){
				self.allMeal.push(new meal(item,self))
			});
		}
	} );
	}
}


window.onload = function(){
	ko.applyBindings(new ViewModel());

	
};
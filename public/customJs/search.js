function meal(data, parent) {
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
	self.city = data.ville;
	self.getClass = function (val) {
		if ((val - 0.5) <= self.note) {
			return "color-green fa fa-star";
		} else {
			return "color-green fa fa-star-o";
		}
	}

};

var ViewModel = function () {

	var self = this;
	self.recherche = ko.observable(recherche);
	self.ville = ko.observable("Montréal");

	self.arrayRecherche = ko.computed(function () {
		if (self.recherche()) {
			return self.recherche().split(" ");
		};

	});
	self.loc = [0, 0];
	self.allMeal = ko.observableArray();
	self.load = function () {
		if (self.arrayRecherche()) {
			var dataM = {
				arrayRequeste: self.arrayRecherche().filter(function (item) {
					return item.length > 3;
				}),
				loc: self.loc
			};
		} else {
			var dataM = { loc: self.loc }
		}
		$.ajax({
			url: 'search',
			type: 'POST',
			data: dataM,
			success: function (data) {
				self.allMeal([]);
				var dataTemp = [];
				data.forEach(function (item) {
					dataTemp.push(new meal(item, self));
				});
				var temp = Table4(dataTemp);
				self.allMeal(temp);
			}
		});
	}

	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (data) {
			self.loc = [data.coords.longitude, data.coords.latitude];
			$.get("http://maps.googleapis.com/maps/api/geocode/json",
				{ latlng: self.loc[1] + ',' + self.loc[0], sensor: true },
				function (data) {
					var res = data.results[0];
					var city = "";
					res.address_components.forEach(function (item) {
						if (item.types.indexOf("sublocality") != -1) {
							city = item.short_name;
						} else if (item.types.indexOf("locality") != -1) {
							city = city + ', ' + item.short_name;
						}
					})
					self.ville(city);
				}
				);
			/*if(item.types.indexOf("sublocality") != -1){
				self.arron(item.short_name);
			}else if(item.types.indexOf("locality")!= -1){
				self.ville(item.short_name);
			}else if(item.types.indexOf("administrative_area_level_1")!= -1){
				self.etat(item.short_name);
			}
			self.*/
			self.load();
		});
    }

}


window.onload = function () {
	ko.applyBindings(new ViewModel());
};

// permet de créer des row de 4 ! 
function Table4(array) {
    var i = 0;
    var x = 0;
    var y = -1;
    var res = [];
    for (i = 0; i < array.length; i++) {
        if (x == 1) {
            res[y].push(array[i]);
            x++;
        } else if (x == 2) {
            res[y].push(array[i]);
            x++;
        } else if (x == 3) {
            res[y].push(array[i]);
            x = 0;
        } else {
            res.push([]);
            y++;
            res[y].push(array[i]);
            x++;
        }
    }

    return res;

}
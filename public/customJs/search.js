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
	self.allMeal = ko.observableArray();
	self.load = function () {
		if (self.arrayRecherche()) {
			var dataM = {
				arrayRequeste: self.arrayRecherche().filter(function (item) {
					return item.length > 3;
				})
			};
		} else {
			var dataM = {}
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
	self.load();
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
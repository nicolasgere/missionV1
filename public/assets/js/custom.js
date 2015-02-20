

var ViewModel = function() {
	var self = this;

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
			data: {desc:self.desc()},
			success: function(){
				self.desc(self.descTemp());
				self.descIsModif(false);
			}
		} );
		
	}
	self.newName = ko.observable();
	self.newPrice = ko.observable();

	self.imageSrc = ko.observable();
	self.imageSrc.subscribe(function(){
		$("#imgForm").submit();
	});

}



window.onload = function(){
	ko.applyBindings(new ViewModel());

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
};
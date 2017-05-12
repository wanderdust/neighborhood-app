var model = {
	initialMap: {
  	div: '#container-map',
  	lat: 40.4717956,
  	lng: -3.8747407
	},
}

// Not working but I will try to fix it

/*var Map = function(data){
	this.div = ko.observable(data.div);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
}*/

var viewModel = function () {
	that = this;

	//that.mapInit = ko.observable(new Map(model.initialMap)); // Try to fix this.
	that.newMap = ko.observable(new GMaps(model.initialMap));
};

ko.applyBindings(new viewModel);
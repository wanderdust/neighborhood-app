var model = {
	initialMap: {
  		div: '#container-map',
  		lat: 40.4717956,
  		lng: -3.8747407
	},
	markers: [
	{
		title: "Jardinillos",
		lat: 40.473665,
		lng: -3.872893,
	},
	{
		title: "Zoco de Majadahonda",
		lat: 40.466651,
		lng: -3.866341,
	},
	{
		title: "Parque Colón",
		lat: 40.468491,
		lng: -3.868619,
	},
	{
		title: "Campo de Rugby",
		lat: 40.475029,
		lng: -3.881676,
	}
	]
};

var Marker = function (data) {
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
}


var viewModel = function () {
	that = this;

	this.map = ko.observable(new GMaps(model.initialMap));

	this.allMarkers = ko.observableArray([]);

	model.markers.forEach(function (data) {
		that.allMarkers.push(new Marker(data))
	});

	this.allMarkers().forEach(function (data) {
		that.map().addMarker({
			lat: data.lat(),
			lng: data.lng(),
			title: data.title(),
			infoWindow: {
			  content: data.title(),
			}
		})
	});
};

ko.applyBindings(new viewModel);
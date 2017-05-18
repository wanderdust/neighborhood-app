var model = {
	initialMap: {
  		div: '#container-map',
  		lat: 40.4717956,
  		lng: -3.8747407
	},
	markers: [
	{
		title: "La Flaca",
		lat: 40.466688,
		lng: -3.866338,
	},
	{
		title: "Cines Zoco",
		lat: 40.466527,
		lng: -3.866565,
	},
	{
		title: "Gastrotasca la Oficina",
		lat: 40.4711161,
		lng: -3.8708896,
	},
	{
		title: "Restaurante la Cuba",
		lat: 40.475229,
		lng: -3.877946,
	},
	{
		title: "Casa Pedro",
		lat: 40.474006,
		lng: -3.875809,
	},
	{
		title: "Parque Colón",
		lat: 40.468433,
		lng: -3.868786,
	}
	]
};

var Marker = function (data) {
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
};


var viewModel = function () {
	var that = this;

	this.map = ko.observable(new GMaps(model.initialMap));

	this.allMarkers = ko.observableArray([]);

	model.markers.forEach(function (data) {
		that.allMarkers.push(new Marker(data))
	});

	this.currentMarker = ko.observable(this.allMarkers()[0]);

	this.allMarkers().forEach(function (data) {
		that.map().addMarker({
			lat: data.lat(),
			lng: data.lng(),
			title: data.title(),
			infoWindow: {
			  content: data.title()
			},
			click: function () {
				// Saves the current object in "this.currentMarker".
				that.currentMarker(data);
			}
		})
	});

	// API for Google images.
	this.getGoogleImg = ko.computed (function () {
		var googleKey = "AIzaSyAViOicVJ6HM_KqQdnRORuUyBf832SgvFU";
		this.imgSrc = ko.observable("https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
			that.currentMarker().title() +
			", Majadahonda&heading=100&pitch=10&scale=2&key=" + 
			googleKey);
		return this.imgSrc();

	})

	// API for getting an adress from Google.
	this.placeAdress = ko.observable("");

	this.getAdress = ko.computed (function (){
		var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" +
			that.currentMarker().lat() + "," + that.currentMarker().lng() + "&sensor=true";

		$.getJSON(url, function(data){
			
			var object = data.results[0].address_components;
			var shortAdress = object[1].short_name + ", " + object[0].short_name + ", " + object[6].short_name;

			that.placeAdress(shortAdress)
			return that.placeAdress();
		}).fail (function(){
			that.placeAdress("No se ha encontrado ninguna dirección.")
		})
	})
};

ko.applyBindings(new viewModel);
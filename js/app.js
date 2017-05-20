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
		info: "Bar de copas de ambiente joven en majadahonda. Precios economicos."
	},
	{
		title: "Cines Zoco",
		lat: 40.466527,
		lng: -3.866565,
		info: "Un cine sin ánimo de lucro, los ingresos obtenidos se destinan a mejorar el cine con lo que pretendemos hacer un cine de los ciudadanos para los ciudadano"
	},
	{
		title: "Gastrotasca la Oficina",
		lat: 40.4711161,
		lng: -3.8708896,
		info: "Si quieres tomarte unas cañas en un buen ambiente, mientras suena buena musica, y pudiendo comer cosas ricas, ¡este es tu sitio!"
	},
	{
		title: "Restaurante la Cuba",
		lat: 40.475229,
		lng: -3.877946,
		info: "Tanto en invierno con su chimeneas interiores, como de primavera a otoño con sus emblemáticas terrazas de exterior, lo hacen un lugar privilegiado del que disfrutar de una agradable velada en cualquier día del año."
	},
	{
		title: "Casa Pedro",
		lat: 40.474006,
		lng: -3.875809,
		info: "Buen restaurante en Majadahonda con aires andaluces."
	},
	{
		title: "Parque Colón",
		lat: 40.468433,
		lng: -3.868786,
		info: "Parque más grande de majadahonda donde se reúnen los jóvenes en verano."
	}
	]
};

var Marker = function (data) {
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.info = ko.observable(data.info);
};


var viewModel = function () {
	var that = this;

	// Initial map object.
	this.map = ko.observable(new GMaps(model.initialMap));

	// 'initialArray' loads the initial data, and JSON data if there is any as RAW OBJECTS.
	this.initialArray = ko.observableArray([]);

	this.init = ko.computed (function () {
		if (!localStorage.placesArray) {
			localStorage.placesArray = JSON.stringify(model.markers);
			var data = JSON.parse(localStorage.placesArray);
			that.initialArray(data);
			localStorage.placesArray = JSON.stringify(data)

		}else {
			that.initialArray(JSON.parse(localStorage.placesArray));
		}
	})

	// Array that will store markers objects converted into observables.
	this.allMarkers = ko.observableArray([]);

	// Converts objects into observables and adds them to the array.
	this.updateArray = ko.computed(function () {
		that.allMarkers([])
		that.initialArray().forEach(function (data) {
			that.allMarkers.push(new Marker(data))
		});
	});

	// Stores the current marker object.
	this.currentMarker = ko.observable(this.allMarkers()[0]);

	// Updates the view for every array element.
	this.updateView = ko.computed( function () {
		//Removes all Markers to re-render the view.
		that.map().removeMarkers();
		that.allMarkers().forEach(function (data) {
			that.map().addMarker({
				lat: data.lat(),
				lng: data.lng(),
				title: data.title(),
				info: data.info(),
				infoWindow: {
				  content: data.title()
				},
				click: function () {
					// Saves the current object in "this.currentMarker".
					that.currentMarker(data);
				}
			})
		})
	});

	// Updates the Current Object when Search list is clicked
	this.updateCurrentMarker = function (data) {
		that.currentMarker(data)
	};

	// API for Google street images.
	this.getGoogleImg = ko.computed (function () {
		var googleKey = "AIzaSyAViOicVJ6HM_KqQdnRORuUyBf832SgvFU";
		this.imgSrc = ko.observable("https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
			that.currentMarker().title() +
			", Majadahonda&heading=100&pitch=10&scale=2&key=" + 
			googleKey);
		return this.imgSrc();
	});

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
		}).fail (function () {
			that.placeAdress("No se ha encontrado ninguna dirección.")
		})
	});

	// Button toggle to show or hide the ADD SECTION.
	this.addSection = ko.observable (false);
	this.toggleButton = function () {
		that.addSection(!that.addSection());
	};

	// Adds new elements to the array.
	this.newTitle = ko.observable("");
	this.newAdress = ko.observable("");
	this.newInfo = ko.observable("");
	
	this.addNewPlace = function () {
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
		that.newAdress()+ 
		",Majadahonda&key=AIzaSyAViOicVJ6HM_KqQdnRORuUyBf832SgvFU";

		// Converts the adress into coordinates.
		$.getJSON(url, function (data) {
			var newObject = {};
			var coord = data.results[0].geometry.location;
			newObject.title = that.newTitle();
			newObject.lat = coord.lat;
			newObject.lng = coord.lng;
			newObject.info = that.newInfo();

			// Updates LocalStorage.
			var parsedArray = JSON.parse(localStorage.placesArray);
			parsedArray.push(newObject);
			localStorage.placesArray = JSON.stringify(parsedArray);

			// Updates the array with the RAW Markers.
			that.initialArray.push(newObject);

			//Clears all the inputs.
			that.newTitle("");
			that.newAdress("");
			that.newInfo("");
		}).fail();
	};

	
	// Creates a live search.
	this.filter = ko.observable();
  	this.places = ko.observableArray([]);
  
	this.visiblePlaces = ko.computed(function(){
		this.places(that.allMarkers())
	    return this.places().filter(function(place){
	        if(!that.filter() || place.title().toLowerCase().indexOf(that.filter().toLowerCase()) !== -1)
	            return place;
	    });
	},this);
};

ko.applyBindings(new viewModel);
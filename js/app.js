var model = {
	initialMap: {
  		div: '#container-map',
  		lat: 40.474263,
  		lng: -3.867406
	},
	markers: markersArray
};

// To convert array elements into observables.
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

	// 'initialArray' loads the initial data, and JSON data if there is any as RAW variables.
	this.initialArray = ko.observableArray([]);

	// Assigns a localStorage to the initial Array and passes that value to an initialArray.
	this.initialData = function () {
		localStorage.placesArray = JSON.stringify(model.markers);
		var data = JSON.parse(localStorage.placesArray);
		that.initialArray(data);
		localStorage.placesArray = JSON.stringify(data)
	}

	// If there is no localStorage it creates it. If there is, it loads the saved data.
	this.init = ko.computed (function () {
		if (!localStorage.placesArray) {
			that.initialData();

		}else {
			that.initialArray(JSON.parse(localStorage.placesArray));
		}
	})

	// AllMarkers stores markers array with observables.
	this.allMarkers = ko.observableArray([]);

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

	// Updates the Current Object.
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

	// Input values to add a new place.
	this.newTitle = ko.observable("");
	this.newAdress = ko.observable("");
	this.newInfo = ko.observable("");

	// Makes error visible when there are emtpy title or adress fields.
	this.throwError = ko.observable(false)

	// Adds new elements to the array.
	this.addNewPlace = function () {
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
		that.newAdress()+ 
		",Majadahonda&key=AIzaSyAViOicVJ6HM_KqQdnRORuUyBf832SgvFU";

		// Verifies that all inputs are not empty.
		if(that.newTitle() !== "" && that.newAdress() !==""){
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

				// When inputs are filled doesn't show any errors.
				that.throwError(false)
			})
		}else(that.throwError(true))
	};

	
	// Creates a live search.
	this.filter = ko.observable();
  	this.places = ko.observableArray([]);
  
	this.visiblePlaces = ko.computed (function () {
		this.places(that.allMarkers())
	    return this.places().filter(function (place) {
	        if(!that.filter() || place.title().toLowerCase().indexOf(that.filter().toLowerCase()) !== -1)
	            return place;
	    });
	},this);

	// Eliminates a Marker from the array.
	this.deletePlace = function (data) {

		// Makes sure that there is at least 1 location in the map.
		if(that.initialArray().length > 1) {
			// Finds the clicked element's index.
			function indexFinder (element) {
				return element.title == data.title();
			}
			// Updates initialArray.
			var index = that.initialArray().findIndex(indexFinder);
			that.initialArray.splice(index, 1);

			// Updates LocalStorage
			var parsedArray = JSON.parse(localStorage.placesArray);
				parsedArray.splice(index, 1);
				localStorage.placesArray = JSON.stringify(parsedArray);
		}else (alert ("Debe existir al menos un lugar en el Mapa."))
	};

	// Resets all the Markers to the original Data.
	this.resetToDefault = function () {
		if(confirm("Toda la información se reseteará a los valores originales.\n¿Estás seguro de que quieres continuar?")){
			that.initialData();
		}
	}
};

ko.applyBindings(new viewModel);
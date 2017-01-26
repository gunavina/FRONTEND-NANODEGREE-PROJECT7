'use strict';

var initialLocations = [
	{
		name: 'Sahni Bakery	',
		lat: 30.4782,
		long: 76.5928
	},
	{
		name: 'Eagle Motel',
		lat: 30.4861,
		long: 76.6040
	},
	{
		name: 'Dawat Restaurant',
		lat: 30.4751,
		long: 76.5816
	},
	{
		name: 'Dominoz',
		lat: 30.4803,
		long: 76.5946
	},
	{
		name:'Mayur Hotel',
		lat: 30.4861,
		long: 76.6028
	},

];

// Declaring global variables now to satisfy strict mode
var map;
var clientId;
var clientSecret;



var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.URL = "";
	this.street = "";
	this.city = "";


	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ','
	+ this.long + '&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.street = results.location.formattedAddress[0];
     	self.city = results.location.formattedAddress[1];


	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page.");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" ;

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

//	self.mapList = [];
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" ;

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);





		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	setTimeout(function(){
			self.infoWindow.close(map,this);
		},2100
	);



	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};


};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 30.4840, lng: 76.5940}
	});

	// Foursquare API settings
	clientId = "V443OTCAQPJLCRY4QWBFYN3ZK5FDKGJOYDHLMI3O342IRVNN";
	clientSecret = "AK1JHLEG2D2KW14WF5HYVFNTUYFTBXYS4LDUUNRAHPR5URLB";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Google Maps has failed. Please check your internet connection and try again.");
}


var famousLocations = [
	{
		name: 'Pizza Hut Delivery',
		lat: 30.3353,
		long: 76.3849,
		foursquareId: '4bb3237b4019a593b38f37b8'
	},
	{
		name: 'Omaxe Mall',
		lat: 30.3374,
		long: 76.3942,
		foursquareId: '4d271280888af04d7fbbb8af'
	},
	{
		name: 'Dominos Pizza',
		lat: 30.3354,
		long: 76.3843,
		foursquareId: '4f93fe90e4b01b89901862cd'
	},
	{
		name: 'Hotel Mohan Continental',
		lat: 30.3344,
		long: 76.3868,
		foursquareId: '51f44ebf8bbd304a6dd467f2'
	},
	{
		name: 'Jaggi Sweets',
		lat: 30.3266,
		long: 76.3991,
		foursquareId: '4e9189eb8231d8feae694cc2'
	},
	{
		name: 'Red Dragon Restaurant',
		lat: 30.3426,
		long: 76.3785,
		foursquareId: '4cf11efc8333224b9e4b088e'
	},
	{
		name: 'Gopals Sweets',
		lat: 30.3356,
		long: 76.3850,
		foursquareId: '51f49aa5498efb82fb11c611'

	},
	{
		name: 'The Yellow Chilli',
		lat: 30.3137,
		long: 76.3956,
		foursquareId: '5517d1ab498edbb34cb06d03'
		}

];


function Phonecheck(pnum) {
    var Obj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (Obj.test(pnum)) {
        var parts = pnum.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "+1 (" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {

        return pnum;
    }
}

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";
	this.foursquareId = data.foursquareId;
	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;


	clientID = "QFSQOZIMWATMNNYXA1JI4TNZJVCQF0QT2BJWRWXPHQVYZUM5";
	clientSecret = "QEQI3EBCWLQU03PTDU2V1VCRAA4A3D2BZHQFC3LJXTPNZIZJ";


	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.street = results.location.formattedAddress[0];
     	self.city = results.location.formattedAddress[1];
      	self.phone = results.contact.phone;
      	if (typeof self.phone === 'undefined'){
			self.phone = ""; // if the value is not defined
		} else {
			self.phone = Phonecheck(self.phone);
		}
	}).fail(function() {
		alert("There was an error please try again");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

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
        '<div class="content">' + self.city + "</div>" +
        '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div></div>";

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 13,
			center: {lat: 30.3398, lng: 76.3869}
	});

	// Foursquare API settings


	famousLocations.forEach(function(locationItem){
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

function error() {
	alert("Please check your internet connection!!!!");
}

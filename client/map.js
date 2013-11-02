Maps = (function () {
    var data = [];
    var self = {
    init: function () {
        // Start location and zoom
        var start = { x: 44.460801721191814,
                      y: -93.15390229225159,
                      z: 16 }

        var me = { x: start.x, y: start.y };
        self.marker = undefined;

        var map = L.mapbox.map('map', 'schiller.map-s9m1r6ii', { zoomControl: false })
            .setView([start.x, start.y], start.z);

        // Enbale or disable drag and zoom handlers
        if (false) {
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
        }

        //////////////////////////
        // Locating user on map //
        //////////////////////////

        // Try to find user location
        if (!navigator.geolocation) {
            console.log('Geolocation denied');
        } else {
            map.locate();
        };

        // Location found
        map.on('locationfound', function(e) {
            map.fitBounds(e.bounds);
            me.x = e.latlng.lat;
            me.y = e.latlng.lng;
            locate_user(me.x, me.y);
        })
        // Location not found
        map.on('locationerror', function() {
            console.log("user said no");
            locate_user(me.x, me.y);
        });

        var locate_user = function(lat, lng) {
            if (!self.marker) {
                self.marker = L.marker(new L.LatLng(lat, lng), {
                    icon: L.mapbox.marker.icon({'marker-color': 'CC0033'}),
                    clickable: false,
                    keyboard: false
                });
            } else {
                self.marker.setLatLng(lat, lng)
            }
            self.marker.addTo(map);
            map.panTo(self.marker.getLatLng());
        }

        /////////////////////////////////
        // First-person implementation //
        /////////////////////////////////

        map.on('drag', function(e) {
            self.marker.setLatLng(map.getCenter());
        });

        map.markerLayer.on('mouseover', function(e) {
            e.layer.openPopup();
        });

        map.markerLayer.on('mouseout', function(e) {
            e.layer.closePopup();
        })

        /////
        // //
        /////

        // Convert spot object to marker object
        var make_marker = function(spot) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [spot.lng, spot.lat]
                },
                "properties": {
                    "title": spot.name,
                    "icon": {
                        "iconUrl": "./marker_w.png",
                        "iconSize": [50, 50], // size of the icon
                        "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                        "popupAnchor": [0, -25]  // point from which the popup should open relative to the iconAnchor
                    }
                }
            };
        };

        map.markerLayer.on('layeradd', function(e) {
            var marker = e.layer,
                feature = marker.feature;
            marker.setIcon(L.icon(feature.properties.icon));
        });

        self.updateMap = function(){
            var party = data.map(make_marker);
            map.markerLayer.setGeoJSON(party);
        }
    },
    addPoint: function (obj, noUpdate){
        data.push(obj);
        if(!noUpdate) self.updateMap();
    },
    removePoint: function (id){
        data = data.filter(function (el, i, arr) {
            return (el.id != id);
        });
        self.updateMap();
    },
    addCurrentLocation: function (name) {
        var x = self.marker.getLatLng();
        var toPost = {
            lng: x.lng,
            lat: x.lat,
            name: name
        };
        // console.dir(toPost);
        self.post(toPost);
    }
    }
    return self;
})();


// {
//     lng: 44.460801721191814,
//     lat: -93.15390229225159,
//     name: "Where the party at",
// }

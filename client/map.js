Maps = (function () {
    var data = [];
    var party = [];
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
            });
            // Location not found
            map.on('locationerror', function() {
                console.log("user said no");
                locate_user(me.x, me.y);
            });

            var locate_user = function(lat, lng) {
                if (!self.marker) {
                    self.marker = L.marker(new L.LatLng(lat, lng), {
                        icon: L.mapbox.marker.icon({'marker-color': 'CC0033'}),
                        zIndexOffset: 1,
                        clickable: false,
                        keyboard: false
                    });
                } else {
                    self.marker.setLatLng(lat, lng)
                }
                self.marker.addTo(map);
                map.panTo(self.marker.getLatLng());
            };

            /////////////
            // Effects //
            /////////////

            // "First person" map dragging
            map.on('drag', function(e) {
                self.marker.setLatLng(map.getCenter());
            });

            // Mouseover tooltips
            map.markerLayer.on('mouseover', function(e) {
                e.layer.openPopup();
            });
            map.markerLayer.on('mouseout', function(e) {
                e.layer.closePopup();
            });

            /////
            // //
            /////

            var last = undefined;

            // Convert spot object to marker object
            var make_marker = function(spot) {
                var age = Date.unow() - spot.created;
                var size = age < self.liveTime ? ~~(100 * (self.liveTime - age) / self.liveTime) : 0;
                return {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [spot.lng, spot.lat]
                    },
                    "opacity": 0.5,
                    "properties": {
                        "title": spot.name,
                        "tags": spot.tags,
                        "icon": {
                            "iconUrl": "./marker.png",
                            "iconSize": [size, size], // size of the icon
                            "iconAnchor": [size/2, size/2], // point of the icon which will correspond to marker's location
                            "popupAnchor": [0, -25]  // point from which the popup should open relative to the iconAnchor
                        }
                    }
                };
            };

            // Set custom icon and tooltip
            map.markerLayer.on('layeradd', function(e) {
                var marker = e.layer,
                    feature = marker.feature;
                marker.setIcon(L.icon(feature.properties.icon));
                var tags = feature.properties.tags ? feature.properties.tags.join(", ") : "";
                var content = '<span.tag>' + tags + '</span>'
                marker.bindPopup(content, {
                    closeButton: false
                });
            });

            self.updateMap = function() {
                party = data.map(make_marker);
                map.markerLayer.setGeoJSON(party);
            };

            // self.updateOpacities = function() {
            //     for (var i = 0; i < party.length; i++) {
            //         var opacity = party[i].opacity;
            //         console.log(opacity);
            //         party[i].setOpacity(opacity * 0.5);
            //     }
            // }
        },

        addPoint: function (obj, noUpdate){
            data.push(obj);
            last = obj;
            if(!noUpdate) self.updateMap();
        },
        removePoint: function (id, noUpdate){
            data = data.filter(function (el, i, arr) {
                return (el.id != id);
            });
            if(!noUpdate) self.updateMap();
        },
        addCurrentLocation: function (name) {
            var x = self.marker.getLatLng();
            var toPost = {
                lng: x.lng,
                lat: x.lat,
                name: name,
                tags: []
            };
            self.post(toPost);
        },
        addTagToLast: function (tag) {
            last && (last['tags'].push(tag));
            self.updateMap();
        }
    }
    return self;
})();


// {
//     lng: 44.460801721191814,
//     lat: -93.15390229225159,
//     name: "Where the party at",
// }

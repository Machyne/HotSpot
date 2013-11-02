Maps = (function () {
    var data = [];
    var self = {
    init: function () {
        // Start location and zoom
        var start = { x: 44.460801721191814,
                      y: -93.15390229225159,
                      z: 16 }

        var me = { x: start.x, y: start.y };

        var map = L.mapbox.map('map', 'schiller.map-s9m1r6ii', { zoomControl: false })
            .setView([start.x, start.y], start.z);

        // Enbale or disable drag and zoom handlers
        if (false) {
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
        }

        // Add draggable marker
        var add_draggable_marker = function(lat, lon) {
            var marker = L.marker(new L.LatLng(lat, lon), {
                icon: L.mapbox.marker.icon({'marker-color': 'CC0033'}),
                draggable: true
            });
            marker.bindPopup('Drag me!');
            marker.addTo(map);
        }

        // Show user location on map
        map.on('locationfound', function(e) {
            // map.fitBounds(e.bounds);
            me_x = e.latlng.lat;
            me_y = e.latlng.lng;
            add_draggable_marker(me_x, me_y);
        })

        // Couldn't get user location
        map.on('locationerror', function() {
            console.log("user said no");
            //add_draggable_marker(me_x, me_y);
        });

        if (!navigator.geolocation) {
            console.log('Geolocation denied');
        } else {
            map.locate();
        };

        // Convert spot object to marker object
        var make_marker = function(spot) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [spot.lat, spot.lng]
                },
                "properties": {
                    "title": spot.name,
                    "icon": {
                        "iconUrl": "./marker.png",
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
    addPoint: function (obj){
        data.push(obj);
        self.updateMap();
    },
    removePoint: function (id){
        data = data.filter(function (el, i, arr) {
            return (el.id != id);
        });
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

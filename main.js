Spots = new Meteor.Collection("spots"); //model

if (Meteor.isClient) {

  // Update whenever the spots database changes
  Spots.find().observeChanges( {
    added: function(id, fields) {
      fields.id = id;
      Maps.addPoint(fields);
    },

    removed: function(id) {
      Maps.removePoint(id);
    }
  });

  // Initialize
  Meteor.startup( function () {

    Maps.init();
    Spots.find().forEach( function(doc, index, cursor) {
      Maps.addPoint({lat: doc.lat, lng: doc.lng, name: doc.name, id: doc._id}, true); //noUpdate = true
    });
    Maps.updateMap();
    Maps.post = function (spot) {
      spot.id = Spots.insert(spot);
      // Maps.addPoint(spot);
    };
    $('.leaflet-bottom.leaflet-right').remove();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // Spots.remove({});
  });
}

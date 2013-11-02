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

    var last = undefined;

    // Show all spots in the database
    Maps.init();
    Spots.find().forEach( function(doc, index, cursor) {
      Maps.addPoint({
        lat: doc.lat,
        lng: doc.lng,
        name: doc.name,
        tags: doc.tags,
        id: doc._id}, true);
    });
    Maps.updateMap();

    // Add a new spot to the database
    Maps.post = function (spot) {
      spot[tags] = [];
      Spots.insert(spot);
      last = spot;
    };

    Maps.addTag = function(tag) {
      last[tags].push(tag);
    }

    $('.leaflet-bottom.leaflet-right').remove();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // Spots.remove({});
  });
}

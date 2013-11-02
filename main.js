Spots = new Meteor.Collection("spots"); //model

if (Meteor.isClient) {
  Spots.find().observeChanges( {
    added: function(id, fields) {
      fields.id = id;
      Maps.addPoint(fields);
    },

    removed: function(id) {
      Maps.removePoint(id);
    }
  });
  Meteor.startup( function () {

    Maps.init();
    Spots.find().forEach( function(doc, index, cursor) {
      Maps.addPoint({lat: doc.lat, lng: doc.lng, name: doc.name, id: doc._id}, true); //noUpdate = true
    });
    Maps.updateMap();
    Maps.post = function (spot) {
      Spots.insert(spot);
    };
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // Spots.remove({});
  });
}

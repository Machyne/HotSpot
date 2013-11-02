Spots = new Meteor.Collection("spots"); //model

if (Meteor.isClient) {
  // Add Timestamps to all spots
  Meteor.methods({
    addItem: function (doc) {
      console.log('HI!');
      doc.when = new Date;
      return Items.insert(doc);
    }
  });

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
      Maps.addPoint({
        lat: doc.lat,
        lng: doc.lng,
        name: doc.name,
        tags: doc.tags,
        id: doc._id}, true);
    });
    Maps.updateMap();
    Maps.post = function (spot) {
      Spots.insert(spot);
    };
    $('.leaflet-bottom.leaflet-right').remove();
  });
}

if (!Date.unow) {
  (function () {
    var uniq = 0;
    Date.unow = function () {
      uniq++;
      return Date.now() + (uniq % 5000);
    };
  })();
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Spots.remove({});
    Spots.before.insert(function (userId, doc) {
        doc.created = Date.unow();
    });
  });
}

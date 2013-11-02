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

    var last_id = undefined;

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
      Spots.insert(spot);
      last_id = spot._id;
    };

    // Add a tag to the last added spot
    // -- in Mongo and locally
    Maps.addTag = function(tag) {
      last_spot = Spots.findOne({_id: last_id});
      Spots.update({_id: last_id}, {'$push': {tags: tag}});
      Maps.addTagToLast(tag);
    }

    $('.leaflet-bottom.leaflet-right').remove();
  });

  $(document).ready(function() {
    // Detect spacebar in the tags field
    $('#tags').keyup(function (e) {
      if (e.keyCode == 32 || e.keyCode == 13) {
        var tag = $(this).val();
        Maps.addTagToLast(tag);
        $(this).val('');
      }
    });
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

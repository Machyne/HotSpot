Spots = new Meteor.Collection("spots"); //model

var liveTime = 1 * 60 * 1000; // min/hour * sec/min * ms/sec  = 1 hour


function runRepeatedly(callback, timeout){
  callback();
  Meteor.setTimeout(function(){runRepeatedly(callback, timeout);}, timeout);
};

if (Meteor.isClient) {
  // Update whenever the spots database changes
  Spots.find().observeChanges( {
    added: function(id, fields) {
      fields.id = id;
      fields.created = fields.created || Date.unow();
      Maps.addPoint(fields);
    },
    removed: function(id) {
      Maps.removePoint(id);
    }
  });

  // Initialize
  Meteor.startup( function () {

    var last = undefined;

    // Add a new spot to the database
    Maps.post = function (spot) {
      spot[tags] = [];
      Spots.insert(spot);
      last = spot;
    };

    Maps.addTag = function(tag) {
      last[tags].push(tag);
    }

    Maps.liveTime = liveTime;

    // Show all spots in the database
    Maps.init();
    Spots.find().forEach( function(doc, index, cursor) {
      Maps.addPoint({
        lat: doc.lat,
        lng: doc.lng,
        created: doc.created,
        name: doc.name,
        tags: doc.tags,
        id: doc._id}, true);
    });

    $('.leaflet-bottom.leaflet-right').remove();
    runRepeatedly(Maps.updateMap, 400);
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
    // Spots.remove({});
    Spots.before.insert(function (userId, doc) {
        doc.created = Date.unow();
    });
    var repeatTime = 1000; // ms
    var purgeDead = function () {
      Spots.find().forEach( function(doc, index, cursor) {
        var age = Date.unow() - doc.created;
        if(age + repeatTime/2 > liveTime){
          Spots.remove({_id: doc._id});
          console.log('yolo');
        }
      });
    };
    runRepeatedly(purgeDead, repeatTime);
  });
}

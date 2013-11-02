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

    var last_id = undefined;

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
    runRepeatedly(Maps.updateMap, 10000);

    $('#hotbutton').click(function() {
      Maps.addCurrentLocation('Wassup');
      // $('#tags-group').fadeIn();
    });

    // Detect spacebar in the tags field
    $('#tagfield').keyup(function (e) {
      var textWidth = function(text){
        var sensor = $('<span>'+text+'</span>').css({margin: 0, padding: 0});
        $('body').append(sensor);
        var width = sensor.innerWidth();
        console.log(sensor);
        sensor.remove();
        return width;
      };
      if (e.keyCode == 32 || e.keyCode == 188 || e.keyCode == 186 || e.keyCode == 13) {
        var tag = $(this).val().replace(/[' .;,"-]/g, '');
        Maps.addTagToLast(tag);
        var w = $('<li>#' + tag + '</li>').prependTo('#tag-list')
          .fadeOut(0).fadeIn().innerWidth();
        $('#tag-list').css({ 'left': -w }).animate({ 'left': 0 }, 200);
        // note, add a box-sizing border-box and a max-width
        $(this).css('paddingLeft', textWidth($(this).val()));
        $(this).val('');
        $(this).animate({'paddingLeft': '0px'}, 500);
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
    var repeatTime = 1000; // ms
    var purgeDead = function () {
      Spots.find().forEach( function(doc, index, cursor) {
        var age = Date.unow() - doc.created;
        if(age + repeatTime/2 > liveTime){
          Spots.remove({_id: doc._id});
        }
      });
    };
    runRepeatedly(purgeDead, repeatTime);
  });
}

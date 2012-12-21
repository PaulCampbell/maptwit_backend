var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var geocoder = require('geocoder');
var moment = require('moment');

var HashTagSchema = new Schema({
    tag: {type:String},
    added: {type:Date, default: Date.now}
})

var TweetSchema = new Schema({
  hashtag: {type:String},
  from_user: { type: String},
  from_user_name: { type:String},
  longitude: {type:Number},
  latitude: {type:Number},
  text: {type: String},
  profile_image_url: {type:String},
  created_at: {type:Date},
  added: {type:Date, default: Date.now},
  longitude_for_map:{type:Number},
  latitude_for_map:{type:Number},
  rating:{type:Number}
});

var VisitSchema = new Schema({
    hashtag:{type:String},
    visit_date:{type:Date, default: Date.now},
    ip_address:{type:String}
});



TweetSchema.virtual('text_as_html').get(function() {
   var tweet = this.text.replace(/(^|\s)@(\w+)/g, '$1@<a href="http://www.twitter.com/$2">$2</a>');
   return tweet.replace(/(^|\s)#(\w+)/g, '$1#<a href="http://search.twitter.com/search?q=%23$2">$2</a>');
 });

TweetSchema.virtual('pretty_date').get(function() {
   var m = new moment(this.created_at);
    return m.fromNow()
 });

TweetSchema.methods.setRatingForMaps = function() {
   var r = 0;
   var ratingPattern = new RegExp(/[1-9]\/10/i);
   var ratingMatches = this.text.match(ratingPattern);
    if(ratingMatches!=null)
      r = parseInt(ratingMatches[0].split("/")[0])

    if(this.text.indexOf('10/10')!=-1)
        r = 10

    this.rating = r;
 }

TweetSchema.virtual('can_be_added_to_map').get(function () {
  var hasPostcode = false;
  var postcodePattern = new RegExp(/[A-Z]{1,2}[0-9]{1,2}/i);
  var postcodeMatches = this.text.match(postcodePattern);
  hasPostcode = postcodeMatches != null

  var hasRating = false;
  var ratingPattern = new RegExp(/[0-9]\/10/i);
  var ratingMatches = this.text.match(ratingPattern);
  hasRating = ratingMatches != null

  return hasPostcode && hasRating;
});

TweetSchema.virtual('embedded_postcode').get(function() {

    var postcodeRegEx =  new RegExp(/[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}/i);
    var postcodeMatches = this.text.match(postcodeRegEx);
    if(postcodeMatches!= null)
        return postcodeMatches[0]

    var outcodePattern = new RegExp(/ [A-Z]{1,2}[0-9]{1,2}/i);
    var outcodeMatches = this.text.match(outcodePattern);
    if(outcodeMatches!=null)
      return outcodeMatches[0].replace(/^\s+|\s+$/g, "");

    return null
})


TweetSchema.methods.setLocationForMaps = function( callback){
    var tweet = this;
    this.setRatingForMaps();
    if(this.embedded_postcode)
    {
        console.log(this.embedded_postcode)
        // it's a uk postcode
        geocoder.geocode(this.embedded_postcode, function ( err, location ) {
          if(err)
          {
              callback(err)
          }
          else
          {
              if(location.results)
              {
                  location.results.forEach(function(l){
                    l.address_components.forEach(function(component){

                         if(component.short_name =='GB')
                         {
                             tweet.latitude_for_map = l.geometry.location.lat
                             tweet.longitude_for_map = l.geometry.location.lng
                         }
                      })
                  })

              }

          }
            callback(null, tweet);
        });
    }
    else
    {
        // geocoded tweet
        if(this.latitude)
            tweet.latitude_for_map = this.latitude;
        if(this.longitude)
            tweet.longitude_for_map = this.longitude;
        callback(null, tweet);
    }

}

exports.Tweet = mongoose.model('Tweet', TweetSchema)
exports.Visit = mongoose.model('Visit', VisitSchema)
exports.HashTag = mongoose.model('HashTag', HashTagSchema)


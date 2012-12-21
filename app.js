var Twitter = require('twitter')
 , mongoose = require('mongoose'),
 Models = require('./Models');

 mongoose.connect('mongodb://localhost/locsit');
 
var start = function(){

 console.log('maptwit process started');
 
var twitter = new Twitter({
    consumer_key: 'FPRURnejrFbLEpXKxO79TQ',
    consumer_secret: 'HeNfvVEE9O0DdyNnq5yxX5iutNtufSBHc9gAY3tc15U',
    access_token_key: '*',
    access_token_secret: '*'
    
});


 
   Models.HashTag.find(function(err, hashtags){
     if(err)
       console.log(err);
     else {
         var tags = '';
         hashtags.forEach(function(tag){
            tags = tags + ',' + tag.tag
         });
         tags = tags.substring(1, tags.length)
         console.log('collecting twitter updates for ' + tags);
         twitter.stream('statuses/filter', {'track':tags}, function(stream) {
           stream.on('data', function(tweet) {
                console.log(tweet);
                
                // set the hashtag
                var appropriateTag = '';
                tags.split(',').forEach(function(theTag){
                console.log(theTag);
                    if(tweet.text.indexOf(theTag)!=-1) {
                      appropriateTag = theTag;
                    }
                 });
                 console.log('tweet for ' + appropriateTag);
                
                if(tweet.text.indexOf('RT:')==-1 && tweet.text.indexOf('RT ')==-1)
                {
                    var t = new Models.Tweet({
                        hashtag: appropriateTag,
                        from_user:tweet.user.screen_name,
                        from_user_name: tweet.user.name,
                        text: tweet.text,
                        profile_image_url: tweet.user.profile_image_url,
                        created_at: tweet.created_at
                    });
                    if(tweet.geo)
                    {
                        t.longitude = tweet.geo.coordinates[0];
                        t.latitude = tweet.geo.coordinates[1];
                    }

                    t.setLocationForMaps(function(err,tweetInstance){
                        if(err)
                            console.log(err)
                        else
                        {
                            t.save();
                        }
                    })
                }
              });
           stream.on('end', function (response) {
             console.log('ended');
             start();
           });
           stream.on('destroy', function (response) {
             console.log('destroyed');
             start();
           });
           });
     }
      
   })
}


start();
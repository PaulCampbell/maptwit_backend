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
           stream.on('data', function(data) {
                console.log(data);
              });
           stream.on('end', function (response) {
             console.log('ended');
             console.log(response)
           });
           stream.on('destroy', function (response) {
             console.log('destroyed');
           });
           });
     }
      
   })
}


start();
var Twitter = require('twitter')
 , mongoose = require('mongoose'),
 Models = require('./Models');

 mongoose.connect('mongodb://localhost/locsit');
 
var start = function(){

 console.log('maptwit process started');
 
   Models.HashTag.find(function(err, hashtags){
     if(err)
       console.log(err);
     else {
         hashtags.forEach(function(tag){
            console.log('collecting twitter updates for ' + tag.tag);
            
            
         });
     }
      
   })
}


start();
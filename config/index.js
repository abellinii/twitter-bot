
//		------------------------------------TWITTER_BOT----------------------------------
//      *																				*
//		*		Functional twitter bot for @aionstakinginfo								*						
//		*		-operates twice daily        											*
//		*		-likes all tweets containing one of the following words: 				*
//		*			[Aion, Stake, Blockchain, Dapp, Aion_Network] 						*
//		*		-Retweets the most popular tweet containing one the following words: 	*
//		*			[Aion_Network, Unity, Staking, Stake] 	     						*
//		*																				*
//		*						LIVE ON AWS LAMBDA                           		    *
//		---------------------------------------------------------------------------------



// Depending on env set API env variables
if (process.env.NODE_ENV === 'production') {
module.exports = require('./prod');
} else {
module.exports = require('./dev');
}

const Twit  = require('twit');
const fs = require('fs');
const path = require('path'); 
const AWS = require("aws-sdk");






//Access AWS to be able to write logs
AWS.config.update({
    accessKeyId: module.exports.aws_access_key_id ,
    secretAccessKey: module.exports.aws_secret_access_key 
  });

var params = {
  Bucket: bucketname,
  Body : tempfile,
  Key : filename
};
   


//Create name for daily log file
var date = new Date();
var filename = "./Log/Activity:" + date.getFullYear() + "/" +
				date.getMonth() + "/" + date.getDate() +
				"-" + date.getHour() + ":" + date.getMinutes() +
				".txt";
var tempfile = "\n\n-----------------Tweet log file for " + date + " ------------------------------\n\n";
var bucketname= 'aion-staking-info-bot';




//Main entry point

exports.handler = (event, context, callback) => {
  createFile(filename);
  var T = new Twit({
   consumer_key: module.exports.consumer_key,
   consumer_secret:module.exports.consumer_secret,
   access_token: module.exports.access_token,
   access_token_secret: module.exports.access_token_secret
	});

  var AionTweets =  getMentionedTweets("Aion%20OR%20Stake%20OR%20Blockchain%20OR%20DApp%20OR%20Aion_Network");
  var unityTweets = getMentionedTweets("Aion_Network%20Unity%20OR%20Staking%20OR%20Stake",true)
  likeTweets(AionTweets);
  reTweet(unityTweets);



}





function createFile(fileName){
	 var day = date.getDay();
	 var S3 = new AWS.S3();

		 if(day % 7 == 0){
		 	clearLogFolder();
		 }

	S3.upload(params,(err,data)=>{

		if(err)console.log("Error loading to S3 bucket");

		if(data)console.log("File uploaded to :" + data.location);
	})
	

}



function writeToFile( input){

   tempfile =+ input
}





function clearLogFolder(){
	 var params = {
    Bucket: bucketname,
    Prefix: 'Log/'
  };

  s3.listObjects(params, function(err, data) {
    if (err) return callback(err);

    if (data.Contents.length == 0) callback();

    params = {Bucket: bucketname};
    params.Delete = {Objects:[]};

    data.Contents.forEach(function(content) {
      params.Delete.Objects.push({Key: content.Key});
    });

    s3.deleteObjects(params, function(err, data) {
      if (err) return  console.log(err);
      
    });
  });
}





//Function to comment on all tweets where [word] is mentioned
function getMentionedTweets(query, pop){
	var ob = {q: query}

		if(pop){
			ob = {q:query,
				  result_type:popular
				  }
		}

	var result = T.get('search/tweets',ob,(err,data,response) =>{
		  	var list =[]
				
			  	for(var t in data){
			  		list.push(t.id);
			  	}
			  	
				  })

	return result;
}






//Function to like a list of tweets
function likeTweets(list){

	for(var tID in list){
		T.post('favorites/create/:id',{id:tID},(err,data,response) =>{

		var text = "Tweet:" + data[0].id + " from user:" + data[1] + " [LIKED]\n";

		writeToFile(text);

		})
	}
}


//Function to retweet a tweet from list
function reTweet(list){

	
		T.post('statuses/retweet/',{id:list[0]},(err,data,response) =>{
        
		var text = "Tweet:" + data.user.id + " from user:" + data[0].tweet.user.screen_name + " [RETWEETED]\n";

		writeToFile(text);

		})
	
}





//		------------------------------------TWITTER_BOT----------------------------------
//      *																				*
//		*		Functional twitter bot for @aionstakinginfo								*						
//		*		-operates twice daily        											*
//		*		-likes all tweets containing one of the following words: 				*
//		*			[Aion, Stake, Blockchain, Dapp, Aion_Network] 						*
//		*		-Retweets the most popular tweet containing one the following words: 	*
//		*			[Aion_Network, Unity, Staking, Stake] 	     						*
//		*																				*
//		*									LIVE ON AWS LAMBDA                          *
//		---------------------------------------------------------------------------------



// Depending on env set API env variables
if (process.env.NODE_ENV === 'production') {
module.exports = require('./prod');
} else {
module.exports = require('./dev');
}



const Twit  = require('Twit');
const fs = require('fs');
const path = require('path'); 


//Create name for daily log file
var date = new Date();
var filename = "./Log/Activity:" + date.getFullYear() + "/" +
				date.getMonth() + "/" + date.getDate() +
				"-" + date.getHour() + ":" + date.getMinutes() +
				".txt";





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

		 if(day % 7 == 0){
		 	clearLogFolder();
		 }

	fs.appendFile(fileName);

}



function writeToFile(file, input){
	fs.appendFile(file,input,(err) => {

		if(err){

			console.log("Error: " + err);
			throw err;
		 }
	})
}





function clearLogFolder(){
	const logDirectory = "../Log";

		fs.readdir(logDirectory, (err,files) =>{
			if(err) throw err;

			for(const file of files){
				fs.unlink(path.join(logDirectory, file),err =>{

					if(err) throw err;
				})
			}
		})

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

		writeToFile(filename,text);

		})
	}
}


//Function to retweet a tweet from list
function reTweet(list){

	
		T.post('statuses/retweet/',{id:list[0]},(err,data,response) =>{
        
		var text = "Tweet:" + data.user.id + " from user:" + data[0].tweet.user.screen_name + " [RETWEETED]\n";

		writeToFile(filename,text);

		})
	
}




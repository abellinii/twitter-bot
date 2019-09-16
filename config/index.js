
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



//Depending on env set API env variables
if (process.env.NODE_ENV === 'production') {
module.exports = require('./prod');
} else {
module.exports = require('./dev');
}

const Twit  = require('twit');
const fs = require('fs');
const path = require('path'); 
const AWS = require("aws-sdk");

 var T = new Twit({
   consumer_key: module.exports.consumer_key,
   consumer_secret:module.exports.consumer_secret,
   access_token: module.exports.access_token,
   access_token_secret: module.exports.access_token_secret
	});




//Access AWS to be able to write logs
AWS.config.update({
    accessKeyId: module.exports.aws_access_key_id ,
    secretAccessKey: module.exports.aws_secret_access_key 
  });


   


//Create name for daily log file
var date = new Date();
var filename = "Log/Activity:" + date.getFullYear() + "-" +
				date.getMonth() + "-" + date.getDate() +
				"-" + date.getHours() + ":" + date.getMinutes() +
				".txt";
var tempfile = "\n\n--------------------------Tweet log file for " + date + " ------------------------------\n\n";
var bucketname= 'aion-staking-info-bot';










function createFile(fileName){
	console.log("file being created")
	 var day = date.getDay();
	 var S3 = new AWS.S3();

		 if(day % 7 == 0){
		 	clearLogFolder();
		 }
		 
		 let params = {
		  Bucket: bucketname,
		  Body : tempfile,
		  Key : filename
		};

	S3.upload(params,(err,data)=>{

		if(err)console.log("Error loading to S3 bucket");

		if(data)console.log("File uploaded to :" + data.location);
	})
	

}



function writeToFile( input){

   tempfile += input
   
}





function clearLogFolder(){
	  params = {
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
   var getMentionedTweets =  function(query, pop){
 		return new Promise(async (res,rej)=>{
 			var list =[]
 	
			var ob = {q: query}

				if(pop){
					ob = {q:query,
						  result_type:"popular"
						  }
				}
				
			       T.get('search/tweets',ob,(err,data,response) =>{
				  		
					  	 for(var t in data.statuses){
					  		
					  		list.push(data.statuses[t].id_str);

							  	}
					  		res(list)
						  })
						  
					 

	    	})
	    
 	}

	







//Function to like a list of tweets
var likeTweets =async function(list){

	var promises =[]
 	
	
	 for(var tID in list){
	 		
	 	promises.push(new Promise(function(res,rej){
		
				var newInt = parseInt(list[tID])
			    T.post('favorites/create',{id:list[tID]},(err,data,response) =>{
						if(data.id_str){
						     text = "Tweet:" + data.id_str + " ,text:" + data.text + " [LIKED]\n";    
						}else{
							 text = "Error: " + data +" [LIKED]\n";
						}

						writeToFile(text)

				}).then((res) => {
		            resolve(res.body[0])
		        }, (res) => {
		            console.log(res)
		        })
         }))

	}

	Promise.all(promises)  


	}





//Function to retweet a tweet from list
var  reTweet = async function(list){

		var rand = parseInt(Math.random() * 10)
			
	   	
		 T.post('statuses/retweet/:id',{id:list[rand]},(err,data,response) =>{
			
				if(data.id_str){	
				 text = "Tweet:" + data._str + " ,text" + data.text + " [RETWEETED]\n";	
				}else{
				 text = "Error: " + data + " [RETWEETED]\n";
				}
				writeToFile(text);

			})
	
		}


//Main entry point

module.exports.handler =  async (event, context) => {
  

   var retweetSearch = await getMentionedTweets("Aion_Network%20#Unity%20OR%20#Staking%20OR%20Stake%20OR%20Staking%20OR%20Stake")

     await reTweet(retweetSearch);

   var likeSearch =  await getMentionedTweets("Aion%20OR%20Stake%20OR%20Blockchain%20OR%20DApp%20OR%20Aion_Network")

     await likeTweets(likeSearch);

   createFile(filename);

}




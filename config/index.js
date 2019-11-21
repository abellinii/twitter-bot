
//		------------------------------------TWITTER_BOT----------------------------------
//      *																				*
//		*		Functional twitter bot for @aionstakinginfo								*						
//		*		-operates hourly            											*
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
const tweet = require('./Tweet');
const Twit  = require('twit');
const fs = require('fs');
const path = require('path'); 
const AWS = require("aws-sdk");
var date 
var filename 
var tempfile
var bucketname
let params = {};


//Create Twit instance
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
function intialiseBotVaraibles(bucket){
 
 date = new Date();
 var minutes = (parseInt(date.getMinutes()) < 10 ) ? '0' + date.getMinutes():date.getMinutes();
 filename = "Log/Activity:" + date.getFullYear() + "-" +
				date.getMonth() + "-" + date.getDate() +
				"-" + date.getHours() + ":" + minutes +
				".txt";
 tempfile += "\n\n--------------------------Tweet log file for " + date + " ------------------------------\n\n";
 bucketname= bucket;

 console.log("Intialising global variables\n" +
 			"file name: " + filename + "\n"  +
 			"bucket name: " + bucketname + "\n"  +
 			"date: " + date )
 	

}






function createFile(fileName){

	return new Promise((res,rej)=>{
	console.log("file being created")
	 var day = date.getDay();
	 var S3 = new AWS.S3();

		 if(day % 7 == 0){
		 	clearLogFolder();
		 }
		 
		  params = {
		  Bucket: bucketname,
		  Body : tempfile,
		  Key : filename
		};

	S3.upload(params,(err,data)=>{

		if(err){
			console.log("Error loading to S3 bucket");
			rej(Error(err))}

		if(data){
			console.log(filename +" uploaded to :" + data.Location);
			res(data)
		}

	})
	
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



//

//Function to comment on all tweets where [word] is mentioned
   var getMentionedTweets =  function(query, notarray){
 		return new Promise(async (res,rej)=>{
 			var list =[]
 	
			var ob = {q: query}

				

				if(notarray){
					   T.get('search/tweets',ob,(err,data,response) =>{
				  		
					  	 for(var t in data.statuses){
					  		
					  		list.push({"id":data.statuses[t].id_str,"userName":data.statuses[t].user.screen_name});

							  	}
					  		res(list);
						  })
				}else{
				
			       T.get('search/tweets',ob,(err,data,response) =>{
				  		
					  	 for(var t in data.statuses){
					  		
					  		list.push(data.statuses[t].id_str);

							  	}
					  		res(list)
						  })
						  
					 }

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






//Main entry point

module.exports.handler =  async (event, context) => {
  
	intialiseBotVaraibles('aion-staking-info-bot');


   var retweetSearch = await getMentionedTweets("Aion_Network%20#Unity%20OR%20#Staking%20OR%20OpenApplictionNetwork%20OR%20Stake%20OR%20Staking%20OR%20Stake")

     await reTweet(retweetSearch);

   var likeSearch =  await getMentionedTweets("Aion%20OR%20Stake%20OR%20Blockchain%20OR%20DApp%20OR%20Aion_Network")

     await likeTweets(likeSearch);

     var replySearch =  await getMentionedTweets("Consensus%20OR%20Proof%20of%20work%20OR%20Proof%20of%20stake%20OR%20Stake%20OR%20Blockchain%20OR%20DApp%20OR%20Hybrid",true)

     await commentTweet(replySearch);

       var tweetAboutPassiveTrustSearch =  await getMentionedTweets("Stake%20AND%20Aion",true)

     await commentAboutThePassiveTrustTweet(tweetAboutPassiveTrustSearch);

     var done = await createFile(filename);

     if(done){
     	console.log("Bot Task Completed")
     }
}




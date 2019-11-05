


//Class to construct a reply tweet to post a link to an article




module.exports = class Tweet{



	constructor(){
		this.id = "";
		this.username = "";
		this.link = "";
		this.comments = [];
	}

	getRandomComment(){
		return this.comments[Math.floor(Math.random() * this.comments.length + 1)];
	}

	getTweet(){
		return "@" + this.username + " " + this.getRandomComment() + "\n " + this.link;
	}


}
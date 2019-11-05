


//Class to construct a reply tweet to post a link to an article




export default class Tweet{

	id;
	username;
	link;
    comments;

	constructor(id, username, link, comments){
		this.id = id;
		this.username = username;
		this.link = link;
		this.comments = comments
	}

	getRandomComment(){
		return this.comments[Math.floor((Math.random() * comments.length + 1)];
	}

	getTweet(){
		return "@" + username + " " + getRandomComment() + "\n " + link;
	}


}
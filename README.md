# twitter-bot


@aionstakinginfo

Twitter bot to increase traffic to [Aion Staking Info](https://aionstakinginfo.com/). A website dedicated to the Aion Network's release of Unity, a combination Proof of Work (PoW) and Proof of Stake (PoS) consensus algorithm. The website will provide a reference to everything related to staking and eventually offer staking to a dedicated
 pool.
 
 For more information on the Aion Network refer [Here](https://aion.network/)
 
 
**Dependencies:**
- [aws-sdk](https://www.npmjs.com/package/aws-sdk)
- [fs](https://www.npmjs.com/package/fs)
- [path](https://www.npmjs.com/package/path)
- [twit](https://www.npmjs.com/package/twit)


**Build**
- [Webpack](https://www.npmjs.com/package/webpack)



# Infrastructure

- CI Deployment using Travis CI
- Stored in AWS S3 bucket
- AWS Lambda function triggered by S3 upload triggers upgade to the orriginal AWS Lambda function

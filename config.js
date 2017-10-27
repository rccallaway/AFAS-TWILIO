/*eslint-env node*/

	//------------------------------------------------------------------------------
	// node.js starter application for Bluemix
	//------------------------------------------------------------------------------

	// This application uses express as its web server
	// for more info, see: http://expressjs.com

var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// create a new express server
var app = express();

/* DOTENV PACKAGE NOT NECESSARY FOR BLUEMIX 
var dotenv = require('dotenv');
dotenv = dotenv.load().parsed;
*/

//---------------------------------------
//HOST For DB
//---------------------------------------
//
// DB DETAILS //
var redis = require("redis");
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

var bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

//---------------------------------------
//TWILIO CREDENTIALS
//---------------------------------------
var twilio = require('twilio');
const username = appEnv.services['user-provided'][0].credentials.accountSID;
const authToken = appEnv.services['user-provided'][0].credentials.authToken;
const baseNumber = "+18569972628";

module.exports = {

  redisClient: redis.createClient(port, host, {no_ready_check: true}),
  twilioClient: twilio(username, authToken),
  authorizeRedis: function(password){this.redisClient.auth(password,
                           (err)=>err?console.error(err.stack):console.log("Successfully connected to sever"))},
  app: app,
  appEnv: appEnv
}

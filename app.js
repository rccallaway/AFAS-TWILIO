// serve the files out of ./public as our main files

//Kubernetes container services in config.js//

var cfg = require('./config');

// SERVER DETAILS //
var bodyParser = require('body-parser');
var phoneRoutes = require('./routes/voices');
var byPhone = phoneRoutes.byPhone;
var outbounds = phoneRoutes.outbounds;
var app = cfg.app;
var appEnv = cfg.appEnv;
var express = require('express');

var messageRoutes = require('./routes/messages');
var sendSMS = messageRoutes.sendSMS;
var repliedBack = messageRoutes.repliedBack;

var twilioClient = cfg.twilioClient;
var redisClient = cfg.redisClient;

function wrapper(f){
  var clients = Array.prototype.slice.call(arguments, 1);//retrieve the clients, remember to include number;
  return function(){
    var originalArguments = Array.prototype.slice.call(arguments);
    return f.apply(null, originalArguments.concat(clients));
  }
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


/*Phone Controllers*/
app.post("/api/voip/call/:number/:practitioner", wrapper(byPhone, twilioClient));

const password = process.env.REDIS_PASSWORD;

cfg.authorizeRedis(password); //Authorizing the Redis Database

app.post("/api/voip/call/outbound/:callback/:pract", wrapper(outbounds, twilioClient, redisClient));

/*-------------------*/

/*Message Controllers*/
app.post("/api/voip/text/:number/:practitioner", wrapper(sendSMS, redisClient,twilioClient));
app.post("/api/voip/textOutbound",  wrapper(repliedBack, redisClient));
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

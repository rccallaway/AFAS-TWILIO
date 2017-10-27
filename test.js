var app = require('./application');
var config = require('.config');
var http = require('http');

//Create an HTTP server and mount express app
//
var server = http.createServer(app);
server.listen(config.port, function(){
  console.log('Express server started on *:'+config.port);
});


// TimeStamp Function //
function TimeStamper(){
  date = new Date();
  return date.toISOString();
};

exports.byPhone = function(request, response, next, twilioClient){
	  var baseNumber = "+18569972628";
	  var number = request.params.number;
	  var practitioner = encodeURIComponent(request.params.practitioner);
	  var callback = encodeURIComponent(request.body.callback);
	  var message = request.body.message;
	  var url = "https://"+request.headers.host;

	  url += "/api/voip/call/outbound/"+callback+"/"+practitioner;
	  var options = {
			 from: baseNumber,
			 to: number,
			 url: url,
			 machineDetection: 'Enable',
			 machineTimeout: 5
			};
	  twilioClient.calls.create(options).then(
			(message) => {
				if (response.status !== 500 ||
				    response.status !== 502 ||
				    response.status !== 404 ){
					response.json(
						      {message: 'received a post from AFAS-CLOUD', 
							signal: 'good', 
							user: `${request.params.practitioner}`
						       }
						      )
				}   else {
					response.status(500).json({message: 'Webhook unable to initialize',
								   signal: 'interrupt',
								   user: `${request.params.practitioner}`
								   });
				}
      }).catch((err)=>{
						  console.error(err);
						  console.error(err.stack);
						  response.status(500).send(err);
		});
}

exports.outbounds = function(request, response, next, twilioClient, redisClient){
  var callback = decodeURIComponent(request.params.callback);
  var pract = decodeURIComponent(request.params.pract);
  var messi;

  redisClient.hgetAsync(pract, "message").then((res)=>{
       messi = res;
       console.log(res);
       var voiceResponse = require('twilio').twiml.VoiceResponse;
       var twimlResponse = new voiceResponse;
       console.log(TimeStamper()+"---------->\t ".concat(messi));
       twimlResponse.say({ voice: 'alice' }, messi );

       twimlResponse.dial(callback);
       console.log(request.body.AnsweredBy);
       redisClient.hset(pract, "answered", request.body.AnsweredBy,(err,reply)=>!err?console.log(reply):console.warn("[VIOLATION] Cannot set answered for practitioner hash"));
       response.send(twimlResponse.toString());
      }).catch((fail)=>{console.error(fail); response.send(twimlResponse.toString())});
        
}

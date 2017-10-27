exports.sendSMS = function(request, response,next, redis, twilio){
  var number = decodeURIComponent(request.params.number);
  var pract = decodeURIComponent(request.params.practitioner);
  var message = request.body.message;

  message += `\n CALL the callback number OR TEXT ${pract} to stop receiving this message`;
  redis.hset(pract, "replied", "no", ((err,reply)=>err?console.error(err.stack):console.log(reply)));

  var options = {
                  to: number,
                  from: "+18569972628",
                  body: message,
                };
  twilio.messages.create(options).then((feedback)=>{
    console.log(feedback);
    response.json({signal: 'message sent to mobile code successfully',
                   provider: practitioner,
                   load: message.length
                  });
  }).catch((feedback)=>{console.log(feedback);response.send(404).send("[VIOLATION]could not send body of text");});

};

exports.repliedBack = function(request, response, next, redis){
  var workingPract = request.body.Body.trim();
  console.log(request.body);
  const MessagingResponse = require('twilio').twiml.MessagingResponse;

  mlresponse = new MessagingResponse();
  //Determine first if the hash exists before continuing down
  redis.multi().exists(workingPract).execAsync().then((bool)=>{
      if (bool[0]){
        redis.multi()
          .hset(workingPract, 'texted', 'yes')
          .hset(workingPract, "replied", "yes")
          .exec((err,reply)=>{
              err?console.error(err.stack):console.log("Successfull SMS transaction for PRACTITIONER "+workingPract);
              });
        mlresponse.type('text/xml');
        mlresponse.message('Thank you for responding to a representative with AFAS');
        response.send(mlresponse.toString());
      } else {
        console.warn(request.body.To.concat(" sent a non-existant signal of a practitioner"));
        response.type('text/xml');
        mlresponse.message("Sorry, this practitioner is no longer corresponding with AFAS, you may ignore this message");
        response.send(mlresponse.toString());
      };
  });
};

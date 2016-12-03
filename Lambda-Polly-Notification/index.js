var http = require('http');
var querystring = require('querystring');

var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

var polly = new AWS.Polly();
var s3 = new AWS.S3();

exports.handler = function (event, context) {

  //If no ?text= querystring exists, then let's just supply a string
  if (event.queryStringParameters == null){
    var val3 = 'This is a test';
  } else {
    var val3 = event.queryStringParameters.text;
  }
  var val4 = decodeURI(val3);

  //hash it for a filename
  var hash = require('crypto').createHash('md5').update(val4).digest('hex');

  var params = {
    //Put the bucket name you want to use
    Bucket: 'BUCKET_NAME_HERE', /* required */
    Key: hash + '.mp3' /* required */
  };
  s3.headObject(params, function(err, data) {

      // File already existed, so no need to have polly synthesize the speech
    if (data){

      console.log(data.ContentLength);
      console.log("Retreiving old file");


      var postData = JSON.stringify({
        //replace this with the name of the media player you want to use
        "entity_id": "media_player.MEDIA_PLAYER_NAME",
        //Replace the bucket URL below
        "media_content_id": "BUCKET_URL_HERE" + hash + ".mp3",
        "media_content_type": "audio/mp3"
      });

      var options = {
        //Edit the IP to be the one you use
        host: '192.168.1.1',
        port: 8123,
        //add password below to URL if you have a password on the API
        path: '/api/services/media_player/play_media',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      apiCallback = function(response){
        var response = {
          "statusCode": 200,
          "headers": {},
          "body": hash
        };
        context.succeed(response);
        console.log(val4);
      }

      var req = http.request(options, apiCallback);
      req.write(postData);
      req.end();


      // If the file did not already exist, then let's have polly synthesize it.
    } else {

      console.log("Making new file");
      var params = {
        OutputFormat: 'mp3', /* required */
        Text: val4, /* required */
        VoiceId: 'Joanna', /* required */
        TextType: 'text'
      };


      var audio = polly.synthesizeSpeech(params, function(err, data) {
        if (err)
        console.log(err, err.stack); // an error occurred

        //Put the bucket name you want to use
        var params1 = {Bucket: 'BUCKET_NAME_HERE', Key: hash + '.mp3', Body: data.AudioStream};
        s3.upload(params1, function(err, data1) {
          console.log(err, data1);

          var postData = JSON.stringify({
            //replace this with the name of the media player you want to use
            "entity_id": "media_player.MEDIA_PLAYER_NAME",
            //Replace the bucket URL below
            "media_content_id": "BUCKET_URL_HERE" + hash + ".mp3",
            "media_content_type": "audio/mp3"
          });

          var options = {
            //Edit the IP to be the one you use
            host: '192.168.1.1',
            port: 8123,
            //add password below to URL if you have a password on the API
            path: '/api/services/media_player/play_media',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          };

          apiCallback = function(response){
            var response = {
              "statusCode": 200,
              "headers": {},
              "body": hash
            };
            context.succeed(response);
            console.log(val4);
          }

          var req = http.request(options, apiCallback);
          req.write(postData);
          req.end();


        });

      });


    }


  });

};

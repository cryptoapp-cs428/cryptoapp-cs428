require('dotenv').load();

var request = require('request');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function handleResult(err, response, body) {
  if (!err) {
    console.log(response.statusCode);
    console.log(body);
  } else {
    console.log('err: ' + err);
  }
}

console.log('╔════════════════╗');
console.log('║ Drop Started.. ║');
console.log('╚════════════════╝');

request.post(process.env.ENDPOINT_PROD + '/drop', handleResult);
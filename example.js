var request = require('request')
,   throttledRequest = require('throttled-request')(request)
,   startedAt = Date.now();
 
throttledRequest.configure({
  requests: 1,
  milliseconds: 2000
});
 
throttledRequest.on('request', function () {
  console.log('Making a request. Elapsed time: %d ms', Date.now() - startedAt);
});
 
//Throttle 10 requests in parallel 
for (var i = 0; i < 10; i++) {
  throttledRequest('https://www.google.com/')
    .on('response', function () {
      console.log('Got response. Elapsed time: %d ms', Date.now() - startedAt);
    });
}

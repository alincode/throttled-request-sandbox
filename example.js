var request = require('request');
var throttledRequest = require('throttled-request')(request);
var startedAt = Date.now();
var urlencode = require('urlencode');
const cheerio = require('cheerio');
const fs = require('fs');

throttledRequest.configure({
  requests: 1,
  milliseconds: 5000
});

throttledRequest.on('request', function() {
  console.log('Making a request. Elapsed time: %d ms', Date.now() -
    startedAt);
});

//Throttle 10 requests in parallel
// for (var i = 0; i < 10; i++) {
//   throttledRequest('https://www.google.com/')
//     .on('response', function() {
//       console.log('Got response. Elapsed time: %d ms', Date.now() - startedAt);
//     });
// }


function getResponseHtml(url, filename) {
  var options = {
    headers: {
      // 'Host': 'www.digikey.com.cn',
      // 'Connection': 'keep-alive',
      // 'Cache-Control': 'max-age=0',
      // 'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
      // 'Accept': 'text/html',
      // 'Accept-Encoding': 'gzip, deflate, sdch',
      'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4'
    }
  };

  console.log('request url:', url);
  return new Promise(function(resolve, reject) {
    options.url = url;
    throttledRequest(options, function(error,
      response, body) {
      if (error) return console.error(error);
      if (response) console.log('http statusCode: ', response.statusCode);

      if (!error && response.statusCode == 200) {
        fs.writeFile(filename + '.html', body, function(err) {
          if (err) return console.error(err);
        });
        // console.log(body);
        resolve(cheerio.load(body));
      }
    })
  });
}

function getCategoryUrls($) {
  let urls = [];
  $('.categoryList a').each(function(i, elem) {
    urls.push($(elem).attr('href'));
  });
  return urls;
}

function getProductUrls($) {
  let urls = [];
  $('.sku').each(function(i, elem) {
    urls.push($(elem).attr('href'));
  });
  return urls;
}

function getResult() {
  var p = getResponseHtml(
    'http://cn.element14.com/browse-for-products',
    'categoryUrls');

  var categoryUrls = [];

  p.then(result => {
    categoryUrls = getCategoryUrls(result);
    fs.writeFile('categoryUrls.txt', categoryUrls, function(err) {
      if (err) return console.error(err);
    });
    // console.log("==========> categoryUrls:", categoryUrls);
    var i = 0;
    categoryUrls.forEach(function(url) {
      i++;
      if (i != 7) return;
      let p2 = getResponseHtml(url, 'productUrlPage');

      p2.then(result2 => {
        let urls = getProductUrls(result2);
        console.log("==========> urls:", urls);
        console.log("==========> length:", urls.length);
      });
    });
    return categoryUrls;
  });


}

getResult();

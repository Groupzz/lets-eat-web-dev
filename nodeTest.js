'use strict';

const yelp = require('yelp-fusion');

var http = require('http');
var url = require('url');
var fs = require('fs');


// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx';

const searchRequest = {
  term:'Mexican',
  location: 'huntington beach, ca'
};

const client = yelp.client(apiKey);

client.search(searchRequest).then(response => {
  var i;
  for(i in response.jsonBody.businesses)
  {
    const result = response.jsonBody.businesses[i];
    const jsonResult = JSON.stringify(result, null, 4);
    console.log(jsonResult);
    //document.getElementById("container").innerHTML = jsonResult;
    element.innerHTML = jsonResult
  }
}).catch(e => {
  console.log(e);
});


http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename = "." + q.pathname;
  fs.readFile("./homepage.html", function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(8080); 
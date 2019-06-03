var app = require('express')();
var http = require('http').server(app);

app.get('/', function(req, res){
    res.sendFile(_dirname + '/index.html');
});

app.listen(3000, "10.39.90.175", () => {
    console.log("starting server");
});

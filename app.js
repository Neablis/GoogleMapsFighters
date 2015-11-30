
// Third party libraries
var express    = require('express');
var raven      = require('raven');
var UUID       = require('node-uuid');
var http       = require('http');

var bodyParser = require('body-parser');

var app        = express();
var server     = http.createServer(app);

// Local files
var config     = require('./config');

var gameLogic  = null;
var port       = process.env.PORT || config.port;

/*
 * Sentry error logging
 */
// var client = new raven.Client('https://efd4a529b0404796a3b94f6854835102:9a51e70bef3346aca83c3a0d37c20a28@app.getsentry.com/57536');
// client.patchGlobal();


//Create a static file server
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//app.use(raven.middleware.express(client));
app.use(function(err, req, res, next) {
    if (res.sentry) {
        res.status(404).end("We encountered a unexpected error code: " + res.sentry);
    }
    next(err);
});

server.listen(port, function() {
    var port = server.address().port;

    gameLogic = require('./scripts/game.setup')(server);
    console.log('App listening at http://%s:%s', "localhost", port);
});
var io          = require('socket.io');
var config      = require('../config');
var World       = require('./world');
var Player      = require('./player');
var Bullet      = require('./bullet');
var sio         = null;

var exports = module.exports = function (server) {

    var module = {};

    sio = io.listen(server);

    sio.sockets.on('connection', function(client) {

        console.log("connection");
        var player = new Player(client.id);

        var handle_positions = function(positions) {
            client.emit("positions", positions);
        }
        World.on("positions", handle_positions);

        var handle_scoreboard = function(scoreboard) {
            client.emit("scoreboard", scoreboard);
        }
        World.on("scoreboard", handle_scoreboard);

        function update_player() {
            client.emit("actual", player.get_actual(Date.now()));
        }
        var player_interval = setInterval(update_player, 100);
        update_player();

        client.on('message', function(m) {
            player.control(m);
        });

        client.on('pew', function(m) {
            new Bullet(player, Date.now());
        });


        client.on('disconnect', function() {
            player.kill();
            clearInterval(player_interval);
            client.removeListener("scoreboard", handle_scoreboard);
            client.removeListener("positions", handle_positions);
        });

    });

    module.sio = sio;

    return module;
};

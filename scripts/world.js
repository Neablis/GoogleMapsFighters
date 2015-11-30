var util = require('util');
var EventEmitter = require('events').EventEmitter;
var highScores  = require('./highscores');

function World() {
    var self = this;
    setInterval(function () {
        _get_player_positions();
    }, 50);
    setInterval(function () {
        self.emit('positions', _get_player_positions());
    }, 500);
    setInterval(function () {
        self.emit('scoreboard', highScores.getScores());
    }, 1000);
}
util.inherits(World, EventEmitter);

var players = [];
var bullets = [];

function _d(a, b, now) {
    a = a.get_actual(now);
    b = b.get_actual(now);
    var d = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    return d;
}

var COLLISION_DISTANCE = 0.001;
function _get_player_positions() {
    var now = Date.now();

    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        for (var j = i + 1; j < players.length; j++) {
            var player_b = players[j];
            if (_d(player, player_b, now) < COLLISION_DISTANCE) {
                player.dead = true;
                player_b.dead = true;
                player.kill();
                player_b.kill();
                console.log("crash");
            }
        }
        for (var j = 0; j < bullets.length; j++) {
            var bullet = bullets[j];
            if (_d(player, bullet, now) < COLLISION_DISTANCE && player !== bullet.player) {
                player.kill();
                player.dead = true;
                bullet.dead = true;
                bullet.player.inc_score(100000);
                console.log("pew");
            }
        }
    }
    players = players.filter(function (player) {return !player.dead})
    bullets = bullets.filter(function (bullet) {return !bullet.dead})
    var players_mapped = players.map(function (player) {return player.get_actual(now)});
    var bullets_mapped = bullets.map(function (bullet) {return bullet.get_actual(now)});
    var player_ids     = players.map(function (player) {return player.get_id()});
    var bullet_ids     = bullets.map(function (bullet) {return bullet.get_id()});
    var return_ids = {};
    for (var x = 0; x < player_ids.length; x++) {
        return_ids[player_ids[x]] = 1;
    }

    for (var x = 0; x < bullet_ids.length; x++) {
        return_ids[bullet_ids[x]] = 1;
    }

    return {positions: players_mapped.concat(bullets_mapped), ids: return_ids};
}

World.prototype.addPlayer = function (player) {
    if (players.indexOf(player) !== -1) return;
    players.push(player);
};

World.prototype.removePlayer = function (player) {
    var index = players.indexOf(player);
    if (index === -1) return;
    players.splice(index, 1);
}


World.prototype.addBullet = function (bullet) {
    if (bullets.indexOf(bullet) !== -1) return;
    bullets.push(bullet);
};

World.prototype.removeBullet = function (bullet) {
    var index = bullets.indexOf(bullet);
    if (index === -1) return;
    bullets.splice(index, 1);
}

module.exports = new World();

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var World = require('./world');
var highScores  = require('./highscores');


var SF_LEFT   = -122.514372;
var SF_TOP    =   37.805804;
var SF_RIGHT  = -122.373609;
var SF_BOTTOM =   37.712433;
var CRUISING  = 0.000005;
var THRUST    = 0.000004;

function Player(id) {
    var self = this;
    var _id = id;
    var _t = Date.now();
    var x = SF_LEFT + Math.random() * (SF_RIGHT - SF_LEFT);
    var y = SF_TOP + Math.random() * (SF_BOTTOM - SF_TOP);
    var dx = 0;
    var _dx = 0;
    var dy = CRUISING;
    var _dy = CRUISING;
    var r = 0;
    var name = null;
    var score = 0;

    function go_home() {
        x = SF_LEFT + Math.random() * (SF_RIGHT - SF_LEFT);
        y = SF_TOP + Math.random() * (SF_BOTTOM - SF_TOP);
    }

    World.addPlayer(self);

    var pressed_vector = {
        up: false,
        down: false,
        left: false,
        right: false,
    };

    var tx = 0;
    var ty = 0;

    var interval = setInterval(function () {
        self.increase_score(10);
    }, 1000);

    self.increase_score = function (v) {
        if (!name) {
            return;
        }

        if (!v) v = 0;
        score += v;
        highScores.addScore(name, _id, score);
    }; 

    self.get_id = function () {
        return _id;
    }

    self.set_name = function (new_name) {
        name = new_name;
    };

    self.get_actual = function (t) {
        var dt = t - _t;
        return { x:x + dx * dt, y:y + dy * dt, dx:dx, dy:dy, r:r, name:name, score: score, id: _id};
    };

    self.get_score = function () {
        return {id:id, name:name, score: score};
    }

    self.inc_score = function (d_points) {
        score += d_points;
    };

    self.control = function (o) {
        var now = Date.now();
        if (o.direction !== undefined) {
            if (o.direction === "home") {
                go_home();
            } else if (o.pressed !== pressed_vector[o.direction]) {
                set_position(calculate_position(now), now);
                pressed_vector[o.direction] = o.pressed;

                if (pressed_vector.left == pressed_vector.right) _dx = 0;
                else if (pressed_vector.left) _dx = -1;
                else _dx = 1;

                if (pressed_vector.up == pressed_vector.down) _dy = 0;
                else if (pressed_vector.down) _dy = -1;
                else _dy = 1;

                var normalizer = THRUST / (Math.sqrt(Math.abs(_dx) + Math.abs(_dy)) || 1);
                _dx *= normalizer;
                _dy *= normalizer;
                _dy += CRUISING;
            }
        }
        if (o.rotation !== undefined) {
            if (o.rotation != r) {
                set_position(calculate_position(now), now);
                r = o.rotation;
            }
        }
        dy = -_dx * Math.sin(r) + _dy * Math.cos(r);
        dx = _dy * Math.sin(r) + _dx * Math.cos(r);

        if (o.name !== undefined) {
            this.set_name(o.name);
        }
    };

    self.kill = function () {
        self.emit("death", {});
        World.removePlayer(self);
        clearTimeout(interval);
    };

    function calculate_position(now) {
        var dt = now - _t;
        return {
            x: x + dx * dt,
            y: y + dy * dt
        };
    }

    function set_position(p, now) {
        x = p.x;
        y = p.y;
        _t = now;
    }
}

util.inherits(Player, EventEmitter);
module.exports = Player;

var World = require('./world');

var CRUISING  = 0.00001;

function Bullet(player, now) {
    var self = this;
    var p = player.get_actual(now);
    var name = p.name + "_bullet";
    var type = "bullet";
    var _id = p.id + "___" + now;
    var r = p.r;
    var dy = CRUISING * Math.cos(r);
    var dx = CRUISING * Math.sin(r);
    var x = p.x + dx * 100;
    var y = p.y + dy * 100;
    var _t = now;
    var player_id = p.id;
    self.player = player;

    World.addBullet(self);
    self.get_actual = function (t) {
        var dt = t - _t;
        return { 
            x:x + dx * dt, 
            y:y + dy * dt, 
            dx:dx, 
            dy:dy, 
            r:r, 
            player_id: player_id,
            name:name,
            type: type, 
            id: _id};
    };

    self.get_id = function () {
        return _id;
    }
    
    setTimeout(function () {
        World.removeBullet(self);
    }, 5000);
}

module.exports = Bullet;

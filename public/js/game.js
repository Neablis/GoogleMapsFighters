var knockoutGame = (function() {
    var game = {};
    game.start_point = {
        lat: 37.7833,
        lng: -122.4167
    }

    var me = document.getElementById("me");
    var highScores = $('#leader-scores');
    var myScore    = $('#score #score-current p');
    var enemies    = $('#enemies');

    game.x = game.start_point.lng;
    game.y = game.start_point.lat;
    game.t = Date.now();
    game.dx = 0;
    game.dy = 0.0;
    game.r = 0;
    game.id = null;
    game._r = 0;
    game.score = score;
    game.me = null;

    game.positions = [];
    game.t_positions = Date.now();

    var viewportDimensions = function () {
        return {
            w: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            h: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        }
    }


    game.set_home = function () {
        game.x = game.start_point.lng;
        game.y = game.start_point.lat;
        game.t = Date.now();
        game.dx = 0;
        game.dy = 0.0;
        game._dx = 0;
        game._dy = 0;
        game.r = 0;
    };

    game.update_scoreboard = function (scores) {
        var ol = $('<ol>');

        for (var i = 0; i < scores.length; i++ ) {
            var li = $('<li>');
            var item = scores[i];
            var span = $('<span>');
            var text = scores[i].user + ": " + scores[i].score;
            span.html(text); // <span>flavour: orange</span>
            li.append(span); 
            ol.append(li);
        }
        highScores.empty().append(ol);

        if (game.score !== 0) {
            myScore.text("Score: " + game.score);
        }
    }

    game.set_my_actual = function(m) {
        //console.log(m);
        game.x = m.x;
        game.y = m.y;
        game.dx = m.dx;
        game.dy = m.dy;
        game.t = Date.now();
        game.r = m.r;
        game._r = m.r;
        game.id = m.id;
        game.score = m.score;
    };


    function fromLatLngToPoint(latLng) {
        var proj = map.getProjection();
        var bounds = map.getBounds();
        var ne = bounds.getNorthEast();
        var n = ne.lat();
        var e = ne.lng();
        var sw = bounds.getSouthWest();
        var s = sw.lat();
        var w = sw.lng();

        var tr = proj.fromLatLngToPoint(ne);
        var bl = proj.fromLatLngToPoint(sw);

        var scale = Math.pow(2, map.getZoom());
        var x_percent = (latLng.lng - w) / (e - w);
        var y_percent = (latLng.lat - s) / (n - s);

        var width = (tr.x - bl.x) * scale;
        var height = (bl.y - tr.y) * scale;

        var output = {x: x_percent * width, y: height - y_percent * height};
        //console.log(output);
        return output;
    }

    game.set_positions = function (m) {
        if (!overlayReady) {
            return;
        }

        $('.enemy').each(function (index, enemy) {
            if (m.ids[enemy.id] !== 1) {
                $('#' + enemy.id).remove();
            }
        });

        game.positions = m.positions;
        game.t_positions = Date.now();
        game.update_my_style();
    };

    game.killed = function (m) {
        console.log("Killed");
        document.location.reload(true);
    }   

    game.create_enemy = function (p) {
        var enemy = document.createElement("div");
        if (p.type === "bullet") {
            enemy.className = "bullet enemy";         
        } else {
            enemy.className = "player enemy";
        }
        enemy.id = p.id;
        enemy.style.position = "absolute";
        var mapped = fromLatLngToPoint({lat:p.y, lng:p.x});
        enemy.style.left = mapped.x + "px";
        enemy.style.top = mapped.y + "px";
        enemies.append(enemy);
    }


    game.update_my_style = function () {
        var dt = Date.now() - game.t;
        var dt_positions = Date.now() - game.t_positions;
        if (!map.setCenter) return;
        

        for (var i = 0; i < game.positions.length; i++) {
            var p = game.positions[i];
            var thing = null;
            if (p.id !== game.id) {
                thing = document.getElementById(p.id);
                if (!thing) {
                    game.create_enemy(p);
                    thing = document.getElementById(p.id);
                } 

                var mapped = fromLatLngToPoint({lat:p.y + dt_positions * p.dy, lng:p.x + dt_positions * p.dx});
                thing.style.transform = "rotate(" + (p.r * 180 / Math.PI) + "deg)";
                thing.style.left = mapped.x  + "px";
                thing.style.top = mapped.y + "px";
            }
        }

        var latLng = { lat: game.y + game.dy * dt, lng: game.x + game.dx * dt}
        map.setCenter(latLng);
        me.style.transform = "rotate(" + (game.r * 180 / Math.PI) + "deg)";
        var mapped = fromLatLngToPoint(latLng);
        me.style.left = (mapped.x - 25) + "px";
        me.style.top = (mapped.y - 25) + "px";
    }

    game.get_pixel_position = function (latlng) {
        if (overlay !== undefined) {
            var point = overlay.getProjection().fromLatLngToDivPixel(latlng); 
            console.log(point);            
        }
    }

    setInterval(function () {
        if (!window.overlayReady) {
            return;
        }
        knockoutGame.update_my_style();
    }, 1000 / 80);

    game.init = function (options) {
        var me = document.getElementById("me");

        if (options.name) {
            game.name = options.name;
            window.socket.emit("message", {
                "time": event.timeStamp,
                "name": game.name
            });
        }

        me.onclick = function(event) {
            keyboardControls.click();
        };

        me.onmousemove = function(event) {
            knockoutGame._r += event.movementX / 100;
            window.socket.emit("message", {
                "time": event.timeStamp,
                "rotation": knockoutGame._r
            });

        };

        document.onkeydown = keyboardControls.keyDown;
        document.onkeyup = keyboardControls.keyUp;
        document.onclick = function () {
            me.requestPointerLock();
        };

        me.requestPointerLock();
        if (!map.setCenter) return;
        map.setZoom(15);
        map.setCenter(game.start_point);
        knockoutGame.update_my_style();
    }

    return game;
}());

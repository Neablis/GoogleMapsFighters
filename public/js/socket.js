"use strict";

var socket = (function () {
    var my_socket = null;
    function init () {
        console.log("init");
        my_socket = io.connect();
        my_socket.on('connect', function(m){
            this.emit = my_socket.emit;
        });

            //Sent when we are disconnected (network, server down, etc)
        my_socket.on('disconnect', function () {
            console.log("Disconnected");
        });
            //Sent each tick of the server simulation. This is our authoritive update
        my_socket.on('onserverupdate', function () {
            console.log("server update");
        });
            //Handle when we connect to the server, showing state and storing id's.
        my_socket.on('onconnected', function () {
            console.log("Onconnected")
        });
            //On error we just show that we are not connected for now. Can print the data.
        my_socket.on('error', function () {
            console.log("Error");
        });
            //On message from the server, we parse the commands and send it to the handlers
        my_socket.on('message', function () {
            console.log("message")
        });

        my_socket.on('scoreboard', function (m) {
            knockoutGame.update_scoreboard(m);
        });
       
        my_socket.on('actual', function (m) {
            knockoutGame.set_my_actual(m);
        });

        my_socket.on('death', function (m) {
            knockoutGame.killed(m);
        });
       
        my_socket.on('positions', function (m) {
            knockoutGame.set_positions(m);
        });
       
        return my_socket;
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    //var emit = debounce(function (type, message) {
    var emit = function (type, message) {
        my_socket.emit(type, message)
    };
    //}, 200);
    
    return {
        init: init,
        emit: emit
    };
}());

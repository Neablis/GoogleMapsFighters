var keyboardControls = (function() {
    var commands = {};


    var pressed_vector = { up: false, down: false, left: false, right: false, };        
    function handle_set(direction, pressed, now) {     
        if (pressed_vector[direction] === pressed) return;     
        pressed_vector[direction] = pressed;       
        window.socket.emit("message", {        
            "time": now,       
            "direction": direction,        
            "pressed": pressed     
        });        
    }      
    function keyCode_to_direction(keyCode) {       
        switch (keyCode) {     
            case 87: case 38: return "up";     
            case 83: case 40: return "down";       
            case 65: case 37: return "left";       
            case 68: case 39: return "right";      
            case 74: case 72: return "home";      
        }      
    }      
    commands.keyDown = function (event) {        
        event = event || window.event;     
        handle_set(keyCode_to_direction(event.keyCode), true, event.timeStamp);        
    }      
    commands.keyUp = function(event) {       
        event = event || window.event;     
        handle_set(keyCode_to_direction(event.keyCode), false, event.timeStamp);       
    };

    commands.click = function(event) {
        event = event || window.event;     
        window.socket.emit("pew");
    }

    return commands;
}());

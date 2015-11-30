//var mongodb = require('mongodb');
var config = require('../config');

var exports = module.exports = (function () {
    var module = {};
    //var MongoClient = mongodb.MongoClient;
    var lowestScore = 0;
    module.currentScores = [];

    // // Connection URL. This is where your mongodb server is running.
    // var url = "mongodb://" + config.mongodb.user + ":" + config.mongodb.password + "@" + config.mongodb.url;

    // // Use connect method to connect to the Server
    // MongoClient.connect(url, function(err, db) {
    //     if (err) {
    //         console.log('Unable to connect to the mongoDB server. Error:', err);
    //     } else {
    //         //HURRAY!! We are connected. :)
    //         console.log('Connection established to', url);

    //         // Get the documents collection
    //         module.collection = db.collection('scores');
    //     }
    // });

    function insertScore (user, id, score) {
        var insertSpot = -1;

        for (var x = 0; x < module.currentScores.length; x++) {
            if (module.currentScores[x].id === id) {
                module.currentScores.splice(x, 1);
                x = module.currentScores.length;
            }
        }

        for (var x = 0; x < module.currentScores.length; x++) {
            if (module.currentScores[x].score < score) {
                insertSpot = x;
                x = module.currentScores.length;
            }
        }

        if (insertSpot === -1) {
            module.currentScores.push({user: user, score: score, id: id});
        } else if (insertSpot === 0) {
            module.currentScores.splice(0, 0, {user: user, score: score, id: id});
        } else {
            module.currentScores.splice(insertSpot-1, 0, {user: user, score: score, id: id});
        }

        module.currentScores = module.currentScores.slice(0,10);
        lowestScore = module.currentScores[module.currentScores.length-1].score;
    };

    module.getScores = function () {
        return module.currentScores;
    };

    module.getLowestScore = function () {
        return lowestScore;
    };

    module.addScore = function (user, id, score) {
        if (score > lowestScore || module.currentScores.length < 10) {
            insertScore(user, id, score);
        }

        return;
    };

    return module;

}());
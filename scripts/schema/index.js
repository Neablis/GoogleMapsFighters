// var mongoose = require('mongoose');
// var User = require('./scores');
// var graffi = require('@risingstack/graffiti-mongoose');

// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/graphql');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/graphql');

import {getSchema} from '@risingstack/graffiti-mongoose';
var graphql =  require('graphql');
import User from './scores';

const options = {
  mutation: false // mutation fields can be disabled
};

const schema = getSchema([User], options);

const query = `{
      addUser(
        name: "john",
        age: 5,
        friends: []
      ) {
        name,
        age
      }
  }`;

console.log("test");
graphql.graphql(schema, query)
  .then(function (results) {
    console.log(results);
  });

  var exports = module.exports = {};
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    // field description
    description: 'the full name of the user'
  },
  hiddenField: {
    type: Date,
    default: Date.now,
    // the field is hidden, not available in GraphQL
    hidden: true
  },
  age: {
    type: Number,
    indexed: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const User = mongoose.model('User', UserSchema);
export default User;
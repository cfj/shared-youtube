const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const userSchema = new Schema({
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
    profileImageUrl: String
  },
});

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
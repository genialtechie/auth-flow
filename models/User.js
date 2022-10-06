const { default: mongoose } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  username: String,
  googleId: String,
  secret: String,
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);

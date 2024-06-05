const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  isMember: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  joinDate: { type: Date, immutable: true, default: Date.now },
});

UserSchema.virtual('fullName').get(function fullName() {
  return `${this.forename} ${this.surname}`;
});

module.exports = mongoose.model('User', UserSchema);

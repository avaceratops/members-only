const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  title: { type: String },
  msg: { type: String, required: true },
  timestamp: { type: Date, immutable: true, default: Date.now },
});

MessageSchema.virtual('timestamp_formatted').get(function format() {
  return DateTime.fromJSDate(this.timestamp).toFormat('dd/mm/yyyy HH:mm');
});

module.exports = mongoose.model('Message', MessageSchema);

const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  title: { type: String },
  message: { type: String, required: true },
  timestamp: { type: Date, immutable: true, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);

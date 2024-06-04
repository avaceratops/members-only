const asyncHandler = require('express-async-handler');

const Message = require('../models/message');

// display list of all messages
exports.message_list = asyncHandler(async (req, res) => {
  const messages = await Message.find()
    .populate('author', 'username forename surname')
    .sort({ timestamp: -1 })
    .exec();
  res.render('index', { messages });
});

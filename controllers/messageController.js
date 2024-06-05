const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const Message = require('../models/message');
const User = require('../models/user');

// display list of all messages
exports.message_list = asyncHandler(async (req, res) => {
  const messages = await Message.find()
    .populate('author', 'username forename surname')
    .sort({ timestamp: -1 })
    .exec();
  res.render('index', { title: 'MessageBoard', messages });
});

exports.message_create_get = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  return res.render('addMessage', { title: 'Add new message' });
};

exports.message_create_post = [
  body('title').trim(),
  body('msg')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message must not be empty'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { title, msg } = req.body;

    // make sure the user is logged in
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    const author = await User.findById(req.user._id);
    const message = new Message({ author, title, msg });

    if (!errors.isEmpty()) {
      return res.render('addMessage', {
        title: 'Add new message',
        message,
        errors: errors.mapped(),
      });
    }

    await message.save();
    return res.redirect('/');
  }),
];

exports.message_delete_post = asyncHandler(async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) return;

  const { id } = req.body;
  try {
    await Message.findByIdAndDelete(id);
  } catch (err) {
    next(err);
  }
  res.redirect('/');
});

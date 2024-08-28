const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

// display list of all messages
exports.message_list = asyncHandler(async (req, res) => {
  const messages = await db.getAllMessages();
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

    if (!errors.isEmpty()) {
      return res.render('addMessage', {
        title: 'Add new message',
        message: { title, msg },
        errors: errors.mapped(),
      });
    }

    await db.insertMessage(req.user.id, title, msg);
    return res.redirect('/');
  }),
];

exports.message_delete_post = asyncHandler(async (req, res) => {
  if (!req.isAuthenticated() || !req.user.is_admin) return;

  try {
    await db.deleteMessage(req.body.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

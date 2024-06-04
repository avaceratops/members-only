const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const User = require('../models/user');

const passwordValidation = (fieldName) =>
  body(fieldName)
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/g)
    .withMessage('Password does not contain an uppercase character')
    .matches(/[0-9]/g)
    .withMessage('Password does not contain a number');

exports.user_create_get = (req, res) => {
  res.render('register');
};

exports.user_create_post = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must contain at least 3 characters')
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('An account with that username already exists');
      }
    }),
  body('forename')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must contain at least 1 character'),
  body('surname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must contain at least 1 character'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error('An account with that email already exists');
      }
    }),
  passwordValidation('password')
    .custom((value, { req }) => value === req.body.passwordConfirm)
    .withMessage('Passwords do not match'),
  passwordValidation('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { username, forename, surname, email, password, passwordConfirm } =
      req.body;
    const user = new User({ username, forename, surname, email, password });

    if (!errors.isEmpty()) {
      return res.render('register', {
        user,
        passwordConfirm,
        errors: errors.mapped(),
      });
    }

    try {
      bcrypt.hash(password, 12, async (err, hashedPassword) => {
        if (err) throw new Error(err);
        user.password = hashedPassword;
        await user.save();
      });
      res.redirect('/');
    } catch (err) {
      next(err);
    }

    return res.redirect('/');
  }),
];

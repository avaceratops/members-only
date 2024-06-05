const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const passport = require('../middleware/passport');
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
  res.render('register', { title: 'Register' });
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
        title: 'Register',
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
    } catch (err) {
      next(err);
    }

    return res.redirect('/');
  }),
];

exports.user_login_get = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  return res.render('login', { title: 'Log in' });
};

exports.user_login_post = (req, res, next) => {
  const { username } = req.body;

  passport.authenticate('local', (err, user, _info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', {
        title: 'Log in',
        user: { username },
        errors: { password: { msg: 'Invalid username or password' } },
      });
    }
    return req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.user_logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect('/');
  });
};

exports.user_membership_get = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  if (req.user.isMember) {
    return res.redirect('/');
  }
  return res.render('membership', { title: 'Membership' });
};

exports.user_membership_post = [
  body('membershipPassword')
    .custom((value) => value === process.env.MEMBERSHIP_PASSWORD)
    .withMessage('Incorrect answer'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    if (!errors.isEmpty()) {
      return res.render('membership', {
        title: 'Membership',
        errors: errors.mapped(),
      });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $set: { isMember: true },
      });
      if (!updatedUser) {
        throw new Error('Unable to update membership');
      }
    } catch (err) {
      next(err);
    }
    return res.redirect('/');
  }),
];

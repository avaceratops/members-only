const compression = require('compression');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const debug = require('debug')('members-only:app');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const PGSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
require('dotenv').config();

const passport = require('./middleware/passport');
const indexRouter = require('./routes/index');

const app = express();
app.set('trust proxy', 1); // needed for Railway hosting

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// sessions setup
app.use(
  session({
    store: new PGSession({ pool }),
    secret: process.env.SECRET,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    saveUninitialized: true,
  })
);
app.use(passport.session());

// forward logged-in user details to views
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.currentUser = req.user;
  }
  next();
});

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// route handlers
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  debug(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;

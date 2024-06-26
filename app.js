const compression = require('compression');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const debug = require('debug')('members-only:app');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const passport = require('./middleware/passport');
const indexRouter = require('./routes/index');

const app = express();
app.set('trust proxy', 1); // needed for Railway hosting

// set up mongoose connection
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;

main()
  .then(() => debug('Connected to MongoDB'))
  .catch((err) => debug('Error connecting to MongoDB:', err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// sessions setup
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
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

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session')
var db = require("./config/connection")
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var fileUpload = require('express-fileupload')
var app = express();

// view engine setuppm fund
// app.set('views', path.join(__dirname, 'views'));
app.set('layout', '../views/layout/layout')
app.set('view engine', 'ejs');

db.connect((err)=>{
  if(err){
    console.log("connection failed")
  }else{
    console.log("database connected successfully")
  }
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
app.use(expressLayouts);

app.use(session({secret:"Key",cookie:{maxAge:60000}}))
app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
const assert = require("assert");

var index = require('./routes/index')
var tasks = require('./routes/tasks');
var about = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//DB connection string.
var url ="mongodb://localhost:27017/todo"

MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log("Error connecting to Mongo server: ", err)
    assert(!err)    //Crash application if error encountered
  }

  console.log("Established database connection ");

  //Export the DB object to all middlewares, so can perform DB operation in the routes modules.
  //http://expressjs.com/en/4x/api.html
  //app.use "mounts" middleware functions for particular paths.
  //Not specifying a path, just a function, defaults to path '/' which is every path

  //So, this function will run for every request. It adds a proprty
  //called db, and set db.tasks to db.collection('tasks'). Now all routes can
  //acccess the DB at req.db.tasks.
  app.use(function(req, res, next) {
    req.db = {};
    req.db.tasks = db.collection('tasks')
    next();   //Need to say next() here or this is the end of request handling for the route.
  });


  //Set up routes, middleware and error handlers
  app.use('/', index);
  app.use('/about', about);
  app.use('/tasks', tasks);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler. will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler, no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

});   //End of MongoDB callback

module.exports = app;

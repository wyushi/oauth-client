var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    routes = require('./routes/index'),
    meanRoutes = require('./routes/mean'),
    lampRoutes = require('./routes/lamp'),
    favicon = require('serve-favicon'),
    swig = require('swig'),
    app = express();

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static file
app.use(express.static(path.join(__dirname, '../client-side')));
app.use(favicon(path.join(__dirname, '../client-side/favicon.ico')));

// template engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './templates'));

// routes
app.use('/api/', routes);
app.use('/mean/', meanRoutes);
app.use('/lamp/', lampRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

'use strict';

var express = require('express'),
    router = express.Router(),
    http = require('http'),
    querystring = require('querystring');


router.get('/', function(req, res, next) {
  res.render('home');
});

module.exports = router;

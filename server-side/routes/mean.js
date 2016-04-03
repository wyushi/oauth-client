'use strict';

var express = require('express'),
    router = express.Router(),
    http = require('http'),
    querystring = require('querystring'),
    oauth = {
      host: '192.168.99.100',
      port: 3000,
      routes: {
        authorize: '/oauth2/authorize',
        token: '/oauth2/token'
      },
      client: {
        username: 'yushi6',
        password: 'wys8833',
        redirect: 'http://192.168.99.100:8080/mean/oauth'
      }
    },
    token = undefined;


router.get('/', function(req, res) {
  var url = 'http://' + oauth.host  + ':' + oauth.port
            + oauth.routes.authorize;
  res.redirect(url +
    '?client_id=' + oauth.client.username +
    '&response_type=' + 'code' +
    '&redirect_uri=' + oauth.client.redirect);
});

router.get('/oauth', function (req, res) {
  if (req.query.code) {
    requestAccessToken(req.query.code, function (data) {
      var ret = JSON.parse(data),
          accessToken = ret['access_token'];
      token = accessToken;
      res.render('mean_token', { accessToken: accessToken });
    });
  }
  else if (req.query.error) {
    res.send(req.query.error);
  }
  else {
    res.send(req);
  }
});

router.get('/articles', function (req, res) {
  getArticles(token.value, function (articles) {
      res.send(articles);
  });
})

function getArticles(accessToken, callback) {
  var options = {
      host: '192.168.99.100',
      port: '3000',
      path: '/api/articles',
      headers: {
          'Authorization': 'Bearer ' + accessToken
      }
  }

  http.get(options, function(res) {
      var data = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          data += chunk;
      });
      res.on('end', function () {
          callback(data);
      });
  });
}

function requestAccessToken(code, callback) {
    var basicAuth = oauth.client.username + ':' + oauth.client.password,
        auth = 'Basic ' + new Buffer(basicAuth).toString('base64'),
        post_data = querystring.stringify({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: oauth.client.redirect
        }),
        post_options = {
          host: oauth.host,
          port: oauth.port,
          path: oauth.routes.token,
          method: 'POST',
          headers: {
              'Authorization': auth,
              'Content-Length': Buffer.byteLength(post_data),
              'Content-Type': 'application/x-www-form-urlencoded'
          }
        },
        req = http.request(post_options, function (res) {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
              callback(chunk);
          });
          res.on('end', () => {});
        });

    req.write(post_data);
    req.end();
}

module.exports = router;

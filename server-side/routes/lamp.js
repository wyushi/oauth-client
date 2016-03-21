'use strict';

var express = require('express'),
    router = express.Router(),
    http = require('http'),
    querystring = require('querystring');


router.get('/', function(req, res, next) {
  res.redirect('http://192.168.99.100:3000/authorize' + 
    '?client_id=oauth_client' + 
    '&response_type=code' + 
    '&redirect_uri=http://192.168.99.100:8080/lamp/oauth' + 
    '&state=xyz');
});

router.get('/oauth',  function(req, res, next) {
    if (req.query.code) {
        console.log("auth_code:" + req.query.code);
        requestAccessToken(req.query.code, function (data) {
            var ret = JSON.parse(data),
                accessToken = ret['access_token'];
            console.log('accessToken: ' + accessToken);
            getUserInfo(accessToken, function (data) {
                res.send(data);
            });
        });
    } else {
        console.log('req: ' + req);
        res.send("hello word");
    }
});

function getUserInfo(accessToken, callback) {
    var options = {
        host: '192.168.99.100',
        port: '3000',
        path: '/users/yushi',
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
    var auth = 'Basic ' + new Buffer("oauth_client:oauth_client_secret").toString('base64');
    var post_data = querystring.stringify({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://192.168.99.100:8080/lamp/oauth'
    });
    var post_options = {
        host: '192.168.99.100',
        port: '3000',
        path: '/token',
        method: 'POST',
        headers: {
            'Authorization': auth,
            'Content-Length': Buffer.byteLength(post_data),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    var req = http.request(post_options, function (res) {
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


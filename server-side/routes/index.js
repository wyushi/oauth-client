var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('http://192.168.99.100:3000/oauth2/authorize' + 
    '?client_id=yushi6' + 
    '&response_type=code' + 
    '&redirect_uri=http://192.168.99.100:8080/api/oauth');
});

router.get('/oauth', function (req, res, next) {
    if (req.query.code) {
        console.log("auth_code:" + req.query.code);
        requestAccessToken(req.query.code, function (data) {
            var ret = JSON.parse(data),
                accessToken = ret['access_token'];
            console.log('accessToken: ' + accessToken.value);
            getArticles(accessToken.value, function (articles) {
                res.send(articles);
            });
        });
    } else {
        console.log('req: ' + req);
        res.send("hello word");
    }
});

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
    var auth = 'Basic ' + new Buffer("yushi6:wys8833").toString('base64');
    var post_data = querystring.stringify({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://192.168.99.100:8080/api/oauth'
    });
    var post_options = {
        host: '192.168.99.100',
        port: '3000',
        path: '/oauth2/token',
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

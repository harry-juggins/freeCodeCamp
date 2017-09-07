var express = require('express');
var mongodb = require('mongodb');
var app = express();

app.use(express.static('public'));

var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;

mongodb.MongoClient.connect(uri, function(err, db) {
  if(err) throw err;
  var urls = db.collection('urls');

  app.get('/', function (req, res) {
    res.send("URL Shortener")
  })
  
  app.get('/new/:url(https?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}\/?)', function(req, res) {
    var url = req.params.url;
    
    var cursor = urls.find({ "original": url}).toArray(function(err, results) {
      console.log(results)
      if (results.length === 0) {
        var shortened = Math.random().toString(36).substring(7)
        urls.insert({ "original": url, "short": shortened });
        res.json({ "original url": url, "short url": req.protocol + "://" + req.host + "/" + shortened})
      } else {
        res.json({ "original url": results[0]['original'], "short url": req.protocol + "://" + req.host + "/" + results[0]['short']})
      }
    })  
  })
  
  app.get('/:short', function(req, res) {
    var short = req.params.short;
    
    var cursor = urls.find({ "short": short }).toArray(function(err, results) {
      if (results.length === 0) {
        res.send("not found")
      } else {
        res.redirect(results[0]['original']);
      }
    })  
  })
  
  // listen for requests :)
  var listener = app.listen("3000", function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });

});


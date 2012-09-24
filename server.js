

var express = require('express'),
	cradle = require('cradle');
	
var app = express();
var db = new(cradle.Connection)('https://food-share.iriscouch.com/', 443).database('foodshare');

db.exists(function (err, exists) {
    if (err) {
      console.log('error', err);
    } else if (exists) {
      console.log('the force is with you.');
    } else {
      console.log('database does not exist, creating it.');
      db.create();
	  db.save('_design/users', {
      all: {
          map: function (doc) {
              if (doc.name && doc.rest) emit(doc.name, doc);
				}
			}
		});
    }
  });
app.set('views', __dirname + '/templates');
app.engine('html', require('ejs').renderFile);

app.use(express.bodyParser());
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res){
  sendAllPicks(res);
});

app.post('/', function(req, res){
  var today = new Date();
  db.save(req.body.name, {'name':req.body.name,'rest':req.body.rest, 'date':today.toDateString()}, function(db_err, db_res) {
	if (db_err) {
		console.log('error saving pick: ' + db_err);
		} else {
		console.log('saved pick: '+req.body.name + ' wants to eat at ' + req.body.rest);
		sendAllPicks(res)
			}
		});
	});

app.get('/home', function(req, res){
  sendAllPicks(res);
});

app.get('/about', function(req, res){
  res.render('about.html');
});

app.get('/contact', function(req, res){
  res.render('contact.html');
});

function sendAllPicks(res) {
	db.view('users/all', function (fetch_err, fetch_res) {
		if (fetch_err) {
			console.log('error fetching all picks: ' + fetch_err) 
		} 	else {
			console.log('picks='+fetch_res);
			res.render('index.html', {picks: fetch_res});
		}
	});
}
   


app.listen(3000);
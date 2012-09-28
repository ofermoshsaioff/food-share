var cradle = require('cradle'), 
	express = require('express')
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
server.listen(8888);

// create socket with socket.io 

io.sockets.on('connection', function (socket) {
	console.log('socket connected to server');
});

// Creating a db connection to irisCouch. 
//if db exists notify, else, create the db and create a view for querying all results.

var db = new(cradle.Connection)('https://food-share.iriscouch.com/', 443).database('foodshare');
db.exists(function (err, exists) {
    if (err) {
      console.log('error', JSON.stringify(err));
    } else if (exists) {
      console.log('the force is with you.');
    } else {
      console.log('database does not exist, creating it.');
      db.create();
	  console.log('creating views');
	  createViews();
    }
  });
  
 
// specify where the static html pages are found
app.set('views', __dirname + '/templates');

// work with ejs to render html 
app.engine('html', require('ejs').renderFile);

app.use(express.bodyParser());

// serve static content: css, js, ico files
app.use('/static', express.static(__dirname + '/static'));

// page handling
app.get('/', function(req, res){
  res.render('index.html');
});

app.post('/', function(req, res){
  var today = new Date();
  db.save(req.body.name,{'name':req.body.name,'rest':req.body.rest, 'date':today.toDateString()}, function(db_err, db_res) {
	if (db_err) {
		console.log('error saving pick: ' + JSON.stringify(db_err));
		} else {
		// returning all picks to client;
		sendAllPicks(res)
		// pushing new pick to other clients
		console.log('pushing new pick to client');
		io.sockets.emit('push',{'name':req.body.name,'rest':req.body.rest, 'date':today.toDateString()});
			}
		});
	});

app.get('/home', function(req, res){
    res.render('index.html');
});

app.get('/about', function(req, res){
  res.render('about.html');  
});

app.get('/picks', function(req, res){
  sendAllPicks(res);
});

function sendAllPicks(res) {
	db.view('rests/group', {group: true}, function(fetch_err, fetch_res) {
	if (fetch_err) {
		console.log(JSON.stringify(fetch_err));
		res.render('picks.html', {picks: []});
		} else {
		console.log('picks='+fetch_res);
		res.render('picks.html', {picks: fetch_res});
		}
	});
}

function createViews() {
	db.save('_design/rests', {
	 group: {
		map: function (doc) {
			if (doc.name && doc.rest) emit(doc.rest, doc);
			},
		reduce: function(key, values, rereduce) {
				var result = [];
				for (var i=0;i<values.length;i++) {
					result.push(values[i].name);
				}
				return result.join(', ');
			}
		}
	});
	
	db.save('_design/users', {
      all: {
          map: function (doc) {
              if (doc.name && doc.rest) emit(doc.name, doc);
				}
			}
	});

}

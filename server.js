var	express = require('express'),
	mongo = require('mongodb');
	
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var port = process.env.PORT || 8888;
server.listen(port);

console.log('Starting Server at port: ' + port);

app.configure(function() {
	app.set('views', __dirname + '/templates');
	app.engine('html', require('ejs').renderFile);
	app.use(express.bodyParser());
	app.use('/static', express.static(__dirname + '/static'));
});

// Count current users
var users = 0;
// Hold pointer to collection
var picks_collection = null;

io.configure(function() {
	io.set('log level', 1)
	io.set("transports", ["xhr-polling"]); 
	io.set("polling duration", 10); 
});

// Create socket with socket.io 

io.sockets.on('connection', function (socket) {
	users++;
	socket.on('disconnect', function() {
		users--;
		console.log('current connected users: ' + users);
	});
	console.log('current connected users: ' + users);
});

// DB setup

mongo.Db.connect("mongodb://ofer.moshaioff:F00dShare@alex.mongohq.com:10018/FoodShareDB", function(error, db) {
	if (error) throw error;
	console.log("Connected to DB");
	db.createCollection('picks', function(err, collection) {
		if (err) console.log(err)
		picks_collection = collection;
	});
});

// Page Handling ///////////////////////////////////////////////////

app.get('/', function(req, res){
  res.render('index.html');
});

app.post('/picks', function(req, res){
  var today = new Date().toDateString();
  var pick = {'name':req.body.name,'rest':req.body.rest, 'date':today, '_id': req.body.name.toLowerCase()};
  picks_collection.save(pick, {safe:true}, function(db_err, db_res) {
	if (db_err) {
		console.log('error saving pick: ' + JSON.stringify(db_err));
		} else {
		// returning all picks to client;
		getAllPicks(res)
		// pushing new pick to other clients
		console.log('pushing new pick to client');
		io.sockets.emit('push',pick);
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
  getAllPicks(res);
});

// End Page Handling ////////////////////////////////////////////////////////////

function getAllPicks(res) {
	var today = new Date().toDateString();
	console.log('querying results for ' + today);
	picks_collection.group(['rest'], {date:today}, {'names':[]}, "function(doc, prev) {prev.names.push(doc.name);}", function(fetch_err, fetch_res) {
	if (fetch_err) {
		console.log(JSON.stringify(fetch_err));
		res.render('picks.html', {picks: [], date:today});
		} else {
		console.log('picks='+fetch_res);
		if (fetch_res.length == 0) fetch_res = [{rest: 'No Picks Today', names: 'Be the first one to pick a spot!'}];
		res.render('picks.html', {picks: fetch_res, date:today});
		}
	});
}

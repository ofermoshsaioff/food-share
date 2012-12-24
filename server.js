var express = require('express'),
    app = require('./app').init_app(),
    mongo = require('mongodb'),
    io = require('socket.io').listen(app);

// Count current users
var users = 0;
// Hold pointer to collection
var picks_collection = null;

io.configure(function () {
    io.set('log level', 1)
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

// Create socket with socket.io 

io.sockets.on('connection', function (socket) {
    users++;
    socket.on('disconnect', function () {
        users--;
        console.log('current connected users: ' + users);
    });
    console.log('current connected users: ' + users);
});

// DB setup

//mongo.Db.connect("mongodb://ofer.moshaioff:F00dShare@alex.mongohq.com:10018/FoodShareDB", function(error, db) {
mongo.Db.connect("mongodb://localhost:10018/FoodShareDB", function (error, db) {
    if (error) throw error;
    console.log("Connected to DB");
    db.createCollection('picks', function (err, collection) {
        if (err) console.log(err)
        picks_collection = collection;
    });
});

// Page Handling ///////////////////////////////////////////////////

app.get('/', function (req, res) {
    res.render('index.html', {
        user: req.user
    });
});

app.post('/picks', function (req, res) {
    var today = new Date().toDateString();
    var pick = {
        'name': req.body.name,
        'rest': req.body.rest,
        'date': today,
        '_id': req.body.name.toLowerCase()
    };
    if (pick.name && pick.rest) {
        picks_collection.save(pick, {
            safe: true
        }, function (db_err, db_res) {
            if (db_err) {
                console.log('error saving pick: ' + JSON.stringify(db_err));
                getAllPicks(req, res)
            } else {
                // returning all picks to client;
                getAllPicks(req, res)
                // pushing new pick to other clients
                console.log('pushing new pick to client');
                io.sockets.emit('push', pick);
            }
        });
    } else {
        getAllPicks(req, res);
    }
});

app.get('/home', function (req, res) {
    res.render('index.html', {
        user: req.user
    });
});

app.get('/about', function (req, res) {
    res.render('about.html', {
        user: req.user
    });
});

app.get('/picks', function (req, res) {
    getAllPicks(req, res);
});

app.get('/login', function (req, res) {
    //res.render('login.ejs', { user: req.user });
    res.redirect('/auth/facebook');
});

app.get('/logout', function (req, res) {
    req.logout();
    res.render('index.html', {
        user: req.user
    });
});




// End Page Handling ////////////////////////////////////////////////////////////

function getAllPicks(req, res) {
    var today = new Date().toDateString();
    console.log('querying results for ' + today);
    picks_collection.group(['rest'], {
        date: today
    }, {
        'names': []
    }, "function(doc, prev) {prev.names.push(doc.name);}", function (fetch_err, fetch_res) {
        if (fetch_err) {
            console.log(JSON.stringify(fetch_err));
            res.render('picks.html', {
                picks: [],
                date: today,
                user: req.user
            });
        } else {
            console.log('picks=' + fetch_res);
            if (fetch_res.length == 0) fetch_res = [{
                rest: 'No Picks Today',
                names: 'Be the first one to pick a spot!'
            }];
            res.render('picks.html', {
                picks: fetch_res,
                date: today,
                user: req.user
            });
        }
    });
}
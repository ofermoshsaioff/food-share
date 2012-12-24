var express = require('express'),
	app = express(),
    mongo = require('mongodb'),
    passport = require('passport'),
    util = require('util'),
    FacebookStrategy = require('passport-facebook').Strategy,
	server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var FACEBOOK_APP_ID = "358810637542642"
var FACEBOOK_APP_SECRET = "708a120fc00544d576fc82f7d59ca6f6";

var port = process.env.PORT || 8888;
server.listen(port);
var ip = process.env.IP || 'http://localhost';

console.log('Starting Server at address: ' + ip + ":" + port);


// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: ip + "/auth/facebook/callback"
},

function (accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

        // To keep the example simple, the user's Facebook profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Facebook account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
}));

app.configure(function () {
    app.use(express.logger());
    app.set('views', __dirname + '/templates');
    app.engine('html', require('ejs').renderFile);
    app.use(express.bodyParser());
    app.use('/static', express.static(__dirname + '/static'));
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'keyboard cat'
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    //	app.use(express.static(__dirname + '/static'));
});



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

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
passport.authenticate('facebook'),

function (req, res) {
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
});

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback',
passport.authenticate('facebook', {
    failureRedirect: '/login'
}),

function (req, res) {
    res.redirect('/home'); // this is not good, need to find a way to fix redirections
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
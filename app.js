var express = require('express'),
    passport = require('passport'),
    //util = require('util'),
    FacebookStrategy = require('passport-facebook').Strategy,
    app = express();

var FACEBOOK_APP_ID = "358810637542642"
var FACEBOOK_APP_SECRET = "708a120fc00544d576fc82f7d59ca6f6";

var port = process.env.PORT || 8888;
var ip = process.env.IP || 'http://localhost';

exports.init_app = function () {

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


    app.listen(port);
    console.log('Starting Server at address: ' + ip + ":" + port);

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

    return app;
}


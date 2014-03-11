var express = require('express')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , dotenv = require('dotenv')
  , mysql = require('mysql')
  , googleapis = require('googleapis')
  , OAuth2Client = googleapis.OAuth2Client;

var global_socket;
dotenv.load();
var e = module.exports;
e.ENV = process.env.NODE_ENV || 'development';
var sendgrid_username = process.env.SENDGRID_USERNAME;
var sendgrid_password = process.env.SENDGRID_PASSWORD;
sendgrid = require('sendgrid')(sendgrid_username, sendgrid_password);

var oauth2Client = new OAuth2Client(process.env.GLASS_CLIENT_ID,
    process.env.GLASS_SECRET, process.env.GLASS_CALLBACK);

// Setup express
var app = express();
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.use(express.favicon('public/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
    app.use(express.errorHandler());
});
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Setup our socket
var serv_io = io.listen(server);
serv_io.sockets.on('connection', function (socket){
    global_socket = socket;
    socket.emit('message', {'text': 'Reveal.js initialized.'});
    socket.on('notes', function(notes){
        console.log(notes);
        gotToken(notes);
    });
});

// We have the token, use it to post to timeline
var success = function (data) {
    console.log('success', data);
};
var failure = function (data) {
    console.log('failure', data);
};
var gotToken = function (msg) {
    googleapis
        .discover('mirror', 'v1')
        .execute(function (err, client) {
            if (!!err) {
                failure();
                return;
            }
            console.log('mirror client', client);
            insertToTimeline(client, failure, success, msg);
        });
};

// Setup Google Authentication
var grabToken = function (code, errorCallback, successCallback) {
    oauth2Client.getToken(code, function (err, tokens) {
        if (!!err) {
            errorCallback(err);
        } else {
            console.log('tokens', tokens);
            oauth2Client.credentials = tokens;
            successCallback();
        }
    });
};

// Send the notes onto a timeline card with a delete option
var insertToTimeline = function (client, errorCallback, successCallback, msg) {
    client
        .mirror.timeline.insert(
        {
            "text": msg,
            "callbackUrl": "https://revealjs-teleprompter.appspot.com/forward?url=http://localhost:3000/reply",
            "menuItems": [
                {"action": "REPLY"},
                {"action": "DELETE"}
            ]
        }
    )
        .withAuthClient(oauth2Client)
        .execute(function (err, data) {
            if (!!err)
                errorCallback(err);
            else
                successCallback(data);
        });
};

// Routes

app.get('/', function (req, res) {
    if (!oauth2Client.credentials) {
        // generates a url that allows offline access and asks permissions
        // for Mirror API scope.
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        res.redirect(url);
    }
    res.redirect('/presentation');
});

app.get('/oauth2callback', function (req, res) {
    // if we're able to grab the token, redirect the user back to the main page
    grabToken(req.query.code, failure, function () {
        res.redirect('/presentation');
    });
});

// The slide presentation is served up here
app.get('/presentation', function(req, res){
    res.sendfile(__dirname + '/views/index.html');
});

// Handle the incoming email votes, where the text in the subject is the vote
app.post('/inbound', function(req, res){
    var parsed_envelope = JSON.parse(req.body.envelope);
    var to = parsed_envelope.from
    var vote = req.body.subject;

    // Store the votes in a DB
    var connection = mysql.createConnection({
        host : process.env.MYSQL_HOST,
        database : process.env.MYSQL_DB,
        user : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASSWORD
    });
    connection.connect(function(err){
        if(err != null) {
            console.log('Error connecting to mysql:' + err+'\n');
        }
    });
    var params = [ to, vote ];
    connection.query('INSERT INTO `votes` (`email`, `vote`) VALUES (?, ?);', params, function(err, rows){
        if(err != null) {
            console.log("Query error:" + err);
        } 
    });
    connection.end();

    // Live update the chart
    global_socket.emit("message", vote);
    
    // Send confirmation to the voter via SendGrid
    var Email = sendgrid.Email;
    var email = new Email({
        to: to,
        from: "community@sendgrid.com",
        subject: "Your vote for " + vote + " has been recorded!",
        text: "Contents of the email go here."
    });
    sendgrid.send(email, function(err, json) {
        if (err) { 
            console.error(err);
            console.log(err.message);
        } else {
            console.log("Email sent to " + to);
        }
    });
    
    res.send(200);
});
var express = require('express')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , dotenv = require('dotenv')
  , mysql = require('mysql');

var global_socket;
dotenv.load();
var e = module.exports;
e.ENV = process.env.NODE_ENV || 'development';
var sendgrid_username = process.env.SENDGRID_USERNAME;
var sendgrid_password = process.env.SENDGRID_PASSWORD;
sendgrid = require('sendgrid')(sendgrid_username, sendgrid_password);

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
    socket.emit("message", "Reveal.js Initialized")
});

// Routes

// The slide presentation is served up here
app.get('/', function(req, res){
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
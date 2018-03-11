require('dotenv').load();


//NPM Dependencies
const fs = require('fs');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken'); // used for auth tokens
const cookieParser = require('cookie-parser');
const nodemailer = require("nodemailer"); //Email Verification
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Project Dependencies
// Import mysql models
const models = require('./models'),
    router = require('./server/router'),
    auth = require('./server/authentication');


// Variables declarations
const app = express();
const saltRounds = 10;
const httpPort = process.env.PORT || 5000;

// Configure email details
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

console.log('');
console.log('Starting..');

// Configure Express
app.use([express.static('build'),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cookieParser()
]);


//////////////////
// Static Files //
//////////////////


app.get('/dashboard', auth.authMiddleWare, (req, res) => {
    res.sendFile(path.join(__dirname + '/build/dashboard.html'));
});


app.use('/', express.static(path.join(__dirname, 'build')))


// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });

// app.get('/elements', function(req, res) {
//     res.sendFile(path.join(__dirname + '/build/elements.html'));
// });

// app.get('/verify', function(req, res) {
//     console.log('verify...')
//     res.sendFile(path.join(__dirname + '/build/verify.html'));
// });


// app.get('/login', function(req, res) {
//     res.sendFile(path.join(__dirname + '/build/login.html'));
// });

// Mount Subrouter
app.use('/', router);




//////////////////
// Start Server //
//////////////////

models.sequelize.sync().then(function() {


    let httpServer = http.createServer(app).listen(httpPort, () => {
        console.log('╔════════════════════════╗');
        console.log('║ HTTP Started Port ' + httpPort + ' ║');
        console.log('╚════════════════════════╝');
    });

});
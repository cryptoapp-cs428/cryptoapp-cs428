
require('dotenv').load();

const fs = require('fs');
const util = require('util');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const jwt = require('jsonwebtoken'); // used for auth tokens
const cookieParser = require('cookie-parser');

// To verify emails of users
const nodemailer = require("nodemailer");

// To encrypt passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');

const https = require('https');
const http = require('http');

const httpPort = process.env.PORT || 5000;

console.log('')
console.log('Starting..');


// Configure Express
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// Import mysql models
let models = require('./models');

// Configure email details
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});


function authenticateRequest(req, res, cb) {
  let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
  
  // Check if token exists
  if (!token) {
    console.log('User didnt provide token..');
    res.redirect('/login');
    return;
  }

  // Verify it
  jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {      
    if (err) {
      console.log('Invalid login token..');
      res.sendFile(path.join(__dirname + '/public/login.html'));
      return;
    } else {

      // Find the user associated with this email
      models.User.findOne({ where: {email: decoded.email} }).then(user => {
        if (!user) {
          // invalid user login
          console.log('Invalid login email..');
          return res.redirect('/login');
        } else if (!user.verified) {
          return res.redirect('/verify');
        } else {
          cb(user);
        }
      });
    }
  });
}


//////////////////
// Static Files //
//////////////////

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/elements', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/elements.html'));
});

app.get('/verify', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/verify.html'));
});

app.get('/dashboard', function (req, res) {
  authenticateRequest(req, res, user => {
    res.sendFile(path.join(__dirname + '/public/dashboard.html'));
  });
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/login.html'));
});


/////////
// API //
/////////

app.get('/names', function (req, res) {
 return res.json({names: [{first: 'Carl', last: 'Smith'}, {first: 'Boof', last: 'Nasty'}]});
});

app.post('/login', (req, res) => {
  console.log('');
  console.log('login tried..');
  console.dir(req.body);

  // search for attributes
  models.User.findOne({ where: {email: req.body.email} }).then(user => {

    // If email doesn't exist
    if (!user) {
      res.status(401).json({ error: 'email doesnt exist'});
      return;
    } 

    console.log('password hash:');
    console.log(user.passwordHash);

    // Check their password with our stored hash
    bcrypt.compare(req.body.password, user.passwordHash, function(err, authenticated) {
      // Invalid password
      if (!authenticated) {
        return res.status(401).json({ error: 'invalid password'});
      }

      // User has logged in
      let token = jwt.sign({email: user.email}, process.env.TOKEN_SECRET, {
        expiresIn: '30d' // expires in x days
      });

      // Set their cookie
      res.cookie('token', token, {
        expires: token.expiresIn,
        httpOnly: false
      });

      return res.redirect('/dashboard');
    });
  });
});

app.get('/logout', (req, res) => {
  console.log('');
  console.log('logout tried..');

  res.clearCookie('token');

  return res.status(200).redirect('/login');
});


app.get('/animals', (req, res) => {
  console.log('');
  console.log('Get Animals..');

  authenticateRequest(req, res, user => {
    models.Animal.findAll()
    .then(function(animalsRaw) {

      // Grab just the date and the count
      // let animals = animalsRaw.map((animal) => { return {date: animal.date, color: animal.color}});
      return res.status(200).send(animalsRaw);
    });
  });
});

app.post('/animals', (req, res) => {
  console.log('');
  console.log('Post Animals..');
  console.log('Name: ' + req.body.name);

  authenticateRequest(req, res, user => {
    if (!user) { return res.redirect('/login') }

    // Store the animal
    models.Animal.create({
      userId: user.id,
      name: req.body.name,
      sourceHash: req.body.sourceHash,
      color: req.body.color
    }).then(newAnimal => { 
      return res.status(200).end();
    }).catch(err => {
      console.log(err);
    });
  });
});


///////////
// Users //
///////////

function createUser(req, res, email, password, cb) {

  console.log('createUser..');
  
  // Check if user exists
  models.User.findAndCountAll({
      where: { email: email }
  })
  .then(result => {

    if (result.count > 0) {
      console.log('..email already exists');
      return res.status(400).json({success: false, reason: 'EMAIL_ALREADY_EXISTS'});;
    } else {

      console.log('..email doesnt exist');

      // Salt and hash their password
      bcrypt.hash(password, saltRounds, (err, passwordHash) => {
        console.log('..password hashed');

        let verifyCode = Math.floor(Math.random() * 900 + 1000) + '';
        console.log('verify code: ' + verifyCode);

        // Send an email
        let emailOptions = {
          from: 'Email Verification <' + process.env.EMAIL_USER + '>',
          to: email,
          subject: 'Please confirm your Email account -- Crypto App',
          html: `<p>Hello,<br> Please enter this code ${verifyCode} to verify your email.</p>`
        };
        // html: `<p>Hello,<br> Please <a href=${verifyCode}>click here</a> to verify your email.</p><br/>
                 // or enter this code ${verifyCode}`,
        transporter.sendMail(emailOptions, function(error, info){
          if (error) {
            console.log('Error: ' + error);
          } else {
            console.log('Message sent: ' + info.response);
          }
        });

        // Store the user
        models.User.create({
            email: email,
            passwordHash: passwordHash,
            verified: false,
            verifyCode: verifyCode,
            color: '#2c3e50' // random default color
        }).then(function (newUser) {

          console.log('..user created');

          // User has logged in
          let token = jwt.sign({email: newUser.email}, process.env.TOKEN_SECRET, {
            expiresIn: '1d' // expires in 24 hours
          });

          res.cookie('token', token, {
            expires : token.expiresIn,
            httpOnly : false
          });

          cb(newUser);
        });
      });
    }
  });
}


app.post('/verify',function(req,res){
  console.log('');
  console.log('Verify user..');

  models.User.findOne({ where: {verifyCode: req.body.code} }).then(user => {
    if (!user) {
      console.log('Invalid verify code..');
      return res.status(400).json({error: 'Invalid verify code'});
    } 
    // Update the user
    user.updateAttributes({verified: true}).then(function (updatedUser) {

      // Set the user cookie
      let token = jwt.sign({email: user.email, password: user.password}, process.env.TOKEN_SECRET, {
        expiresIn: '30d' // expires in 24 hours
      });
      res.cookie('token', token, {
        expires : token.expiresIn,
        httpOnly : false
      });

      res.redirect('/dashboard');
    });
  });
});


// Called by sign up page
app.post('/join', async (req, res) => {

  console.log('');
  console.log('New User..');

  let email = req.body.email;
  let password = req.body.password;

  // Validate email and password (maybe do some extra sterilizing here..)
  if (email === '' || email === undefined) {
    return res.status(400).json({success: false, error: 'Invalid email.'});
  }
  if (password === '' || password === undefined) {
    return res.status(400).json({success: false, error: 'Invalid password.'});
  }

  // Create and store User
  createUser(req, res, email, password, (newUser) => {
    console.log('User added: ' + newUser.email);
    console.log('redirect..');
    return res.redirect('/dashboard');
  });
});


// GET User
app.get('/user', (req, res) => {
  console.log('');
  console.log('Get User..');

  authenticateRequest(req, res, user => {
    return res.status(200).send(user);
  });
});

// GET User
app.post('/user-stats', (req, res) => {
  console.log('');
  console.log('Post User Stats..');

  authenticateRequest(req, res, user => {
    user.updateAttributes({color: req.body.color}).then(function (updatedUser) {
      return res.status(200).send(updatedUser);
    });
  });
});


/////////////
// Helpers //
/////////////

// GET All users (Helper Method)
app.get('/users', function (req, res) {
  console.log('');
  console.log('Get Users..');

  authenticateRequest(req, res, user => {
    models.User.findAll()
    .then(function(users) {
      return res.status(200).send(users);
    });
  });
});

app.get('/tables', function (req, res) {
  console.log('');
  console.log('Get Tables..');

  models.sequelize.authenticate()
  .then(() => {
    models.sequelize.query('show tables').then(function(rows) {
      res.send(rows);
    });
  });
});

// Drop all Tables
app.post('/drop', function (req, res) {
  console.log('');
  console.log('Drop Tables..');

  models.sequelize.sync({force: true})
  .then(response => {
    res.send('dropped');
  });
});


//////////////////
// Start Server //
//////////////////

models.sequelize.sync().then(function () {



  let httpServer = http.createServer(app).listen(httpPort, () => {
    console.log('╔════════════════════════╗');
    console.log('║ HTTP Started Port '+httpPort+' ║');
    console.log('╚════════════════════════╝');
  });

});
























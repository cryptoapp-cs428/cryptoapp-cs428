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

console.log('');
console.log('Starting..');


// Configure Express
app.use(express.static('build'));
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

let compareSignature = (signature, ethAddress, cb) => {
  // TODO IMPLEMET THIS
  return (null, true) // (err, authenticated)
}


function createUser(req, res, ethAddress, signature, cb) {

  console.log('createUser..');
  console.dir(ethAddress);
  console.dir(signature);
  
  // Check if user exists
  models.User.findAndCountAll({
      where: { ethAddress: ethAddress }
  })
  .then(result => {

    console.log(222);

    if (result.count > 0) { // shouldn't ever get here, but just in case
      console.log('..address already exists');
      return cb('ADDRESS_ALREADY_EXISTS');
    } else {

      console.log(333);

      console.log('..address doesnt exist');

      // Store the user
      models.User.create({
        ethAddress: ethAddress,
        name: null,
        email: null
      }).then(function (newUser) {

        console.log(444);

        console.log('..user created');

        // User has logged in
        let token = jwt.sign({ethAddress: newUser.ethAddress}, process.env.TOKEN_SECRET, {
          expiresIn: '30d' // expires in x days
        });

        res.cookie('token', token, {
          expires : token.expiresIn,
          httpOnly : false
        });

        cb(null, newUser);
      });
    }
  });
}


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
      console.log('Invalid login..');
      res.sendFile(path.join(__dirname + '/public/login'));
      return;
    } else {

      // Find the user associated with this email
      models.User.findOne({ where: {ethAddress: decoded.ethAddress} }).then(user => {
        if (!user) {
          // invalid user login
          console.log('Invalid login email..');
          return res.redirect('/login');
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
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.get('/elements', function (req, res) {
  res.sendFile(path.join(__dirname + '/build/elements.html'));
});

app.get('/dashboard', function (req, res) {
  console.log('tried to get dash..');
  authenticateRequest(req, res, user => {
    res.sendFile(path.join(__dirname + '/build/dashboard.html'));
  });
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname + '/build/login.html'));
});

/////////
// API //
/////////

app.post('/login', (req, res) => {
  console.log('');
  console.log('login tried..');
  console.dir(req.body);

  // If invalid input
  if (req.body.ethAddress === undefined || req.body.ethAddress === "" ||
      req.body.signature === undefined || req.body.signature === "" ) {
    return res.json({success: false, reason: 'invalid ethAddress'});
  }

  // search for same eth address
  models.User.findOne({ where: {ethAddress: req.body.ethAddress} }).then(user => {

    // If email doesn't exist
    if (!user) {
      // Create a new user
      user = createUser(req, res, req.body.ethAddress, req.body.signature, (err, newUser) => {
        return res.redirect('/dashboard.html');
      });

    } else {
      compareSignature(req.body.signature, user.ethAddress, (err, authenticated) => {
        // Invalid address signature pair
        if (!authenticated) { return res.status(401).json({ error: 'invalid password'}); }

        // User has logged in
        let token = jwt.sign({email: user.ethAddress}, process.env.TOKEN_SECRET, {
          expiresIn: '30d' // expires in x days
        });

        // Set their cookie
        res.cookie('token', token, {
          expires: token.expiresIn,
          httpOnly: false
        });

        return res.status(200).redirect('/dashboard');
      });
    }
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
    // models.Animal.findAll({where: {
    //   userId: user.id
    // }})
    .then(function(animalsRaw) {
      // Grab just the date and the count
      // let animals = animalsRaw.map((animal) => { return {date: animal.date, color: animal.color}});
      return res.status(200).send(animalsRaw);
    });
  });
});

app.post('/shapes', (req, res) => {
  console.log('');
  console.log('Post Shapes..');
  console.dir(req.body);

  authenticateRequest(req, res, user => {
    // Store the animal
    models.Shape.create({
      ethAddress: req.body.ethAddress,
      userEthAddress: user.ethAddress,
      color: req.body.color,
      experience: req.body.experience,
      level: req.body.level
    }).then(newShape => { 
      return res.status(200).end();
    }).catch(err => {
      console.log(err);
    });
  });
});


/////////////
// Battles //
/////////////

app.get('/battles', (req, res) => {
  console.log('');
  console.log('Get Battles..');

  authenticateRequest(req, res, user => {
    models.Battle.findAll({where: {
      userEthAddressSource: user.ethAddress
    }})
    .then(function(battlesRaw) {
      return res.status(200).send(battlesRaw);
    });
  });
});

// Create a new battle
app.post('/battles', (req, res) => {
  console.log('');
  console.log('Post Battles..');

  authenticateRequest(req, res, user => {
    // Store the animal
    models.Battle.create({
      creationTimeUTC: new Date().getTime(),
      battleTimeUTC: null, // hasn't happened yet
      sourceWon: null, // did the source shape with the battle?
      occurred: false, // did the battle happen?
      userEthAddressSource: user.ethAddress,
      userEthAddressTarget: req.body.userEthAddressTarget,
      shapeEthAddressSource: req.body.shapeEthAddressSource,
      shapeEthAddressTarget: req.body.shapeEthAddressTarget,
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
























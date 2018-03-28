require('dotenv').load();

const fs = require('fs');
const util = require('util');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const solidityAPI = require('./solidity/facades/backend');
const Shape = require('./solidity/facades/shape');

const jwt = require('jsonwebtoken'); // used for auth tokens
const cookieParser = require('cookie-parser');

// To verify emails of users
const nodemailer = require("nodemailer");

// To encrypt passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');

// Crypto Password Checks
const ethUtil = require('ethereumjs-util');


const https = require('https');
const http = require('http');

const httpPort = process.env.PORT || 5000;

console.log('');
console.log('Starting..');


// Configure Express
app.use([
    express.static('build'),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cookieParser()
]);


// Import mysql models
let models = require('./models');

// Configure email details
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const compareSignature = (signature, ethAddress, cb) => {
    try {
        let data = `CryptoShapes Sign`;
        let message = ethUtil.toBuffer(data)
        let msgHash = ethUtil.hashPersonalMessage(message)
        // Get the address of whoever signed this message
        // Lot's of cryptography stuff more about which can be leart at : https://hackernoon.com/never-use-passwords-again-with-ethereum-and-metamask-b61c7e409f0d
        let signature = ethUtil.toBuffer(signature)
        let sigParams = ethUtil.fromRpcSig(signature)
        // Given a message and a signature, get the publicKey
        var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
        var sender = ethUtil.publicToAddress(publicKey)
        var addr = ethUtil.bufferToHex(sender)

        return cb(null, addr == ethAddress)
    } catch (err) {
        return cb(err);
    }
}


const createUser = (req, res, ethAddress, signature, cb) => {

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
                }).then(function(newUser) {

                    console.log(444);

                    console.log('..user created');

                    // User has logged in
                    let token = jwt.sign({ ethAddress: newUser.ethAddress }, process.env.TOKEN_SECRET, {
                        expiresIn: '30d' // expires in x days
                    });

                    res.cookie('token', token, {
                        expires: token.expiresIn,
                        httpOnly: false
                    });

                    cb(null, newUser);
                });
            }
        });
}


const authenticateRequest = (req, res, cb) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;

    // Check if token exists
    if (!token) {
        console.log('User didnt provide token..');
        return res.redirect('/login');
    }

    // Verify it
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) {
            console.log('Invalid login..');
            res.sendFile(path.join(__dirname + '/public/login'));
            return;
        } else {

            // Find the user associated with this email
            models.User.findOne({ where: { ethAddress: decoded.ethAddress } }).then(user => {
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

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.get('/elements', function(req, res) {
    res.sendFile(path.join(__dirname + '/build/elements.html'));
});

app.get('/dashboard', function(req, res) {
    console.log('tried to get dash..');
    authenticateRequest(req, res, user => {
        res.sendFile(path.join(__dirname + '/build/dashboard.html'));
    });
});

app.get('/login', function(req, res) {
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
        req.body.signature === undefined || req.body.signature === "") {
        return res.json({ success: false, reason: 'invalid ethAddress' });
    }

    // search for same eth address
    models.User.findOne({ where: { ethAddress: req.body.ethAddress } }).then(user => {

        // If email doesn't exist
        if (!user) {
            // Create a new user
            user = createUser(req, res, req.body.ethAddress, req.body.signature, (err, newUser) => {
                return res.redirect('/dashboard.html');
            });

        } else {
            compareSignature(req.body.signature, user.ethAddress, (err, authenticated) => {
                // Invalid address signature pair
                if (!authenticated) { return res.status(401).json({ error: 'metamask auth failed' }); }

                // User has logged in
                let token = jwt.sign({ email: user.ethAddress }, process.env.TOKEN_SECRET, {
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


/**
 * Returns all the shapes owned by the current user
 */
app.get('/shapes', (req, res) => {
    console.log("");
    console.log('Get Shapes..');

    authenticateRequest((req, res, user => {
        models.Shape.findAll({
                where: {
                    userEthAddress: user.ethAddress,
                }
            })
            .then(function(shapesRaw) {
                return res.status(200).send(shapesRaw);
            })
    }));
});


/**
 * Returns all shapes not owned by the current user
 */
app.get('/opponents', (req, res) => {
    console.log("");
    console.log("Get opponents");

    authenticateRequest((req, res, user => {
        models.Shape.findAll({
                where: {
                    [models.Sequelize.Op.not]: [
                        { userEthAddress: user.ethAddress, }
                    ]
                }
            })
            .then(function(opponentsRaw) {
                return res.status(200).send(opponentsRaw)
            })
    }));
});

/**
 * Returns all battles that the user has been challenged to, but has not yet accepted or rejected
 */
app.get('/battles/challenged', (req, res) => {
    console.log("");
    console.log("Get Challenges");

    authenticateRequest((req, res, user => {
        models.Battle.findAll({
                where: {
                    [models.Sequelize.Op.and]: [
                        { userEthAddressTarget: user.ethAddress },
                        { pendingTargetResponse: true },
                    ],
                }
            })
            .then(function(battlesRaw) {
                return res.status(200).send(battlesRaw)
            })
    }));
});


/**
 * Returns a list of all the battles that the user has challenged other players to, but the opponent has not yet accepted
 */
app.get('/battles/pending', (req, res) => {
    console.log("");
    console.log("Get Pending Battles");

    authenticateRequest((req, res, user => {
        models.Battle.findAll({
                where: {
                    [models.Sequelize.Op.and]: [
                        { userEthAddressSource: user.ethAddress },
                        { pendingTargetResponse: true },
                    ],
                }
            })
            .then(function(battlesRaw) {
                return res.status(200).send(battlesRaw)
            })
    }));
});

/**
 * Returns a list of resolved battles the user participated in
 */
app.get('/battles/history', (req, res) => {
    console.log("");
    console.log("Get Battle History");

    authenticateRequest((req, res, user => {

        models.Battle.findAll({
                where: {
                    [models.Sequelize.Op.or]: [
                        { userEthAddressSource: user.ethAddress },
                        { userEthAddressSource: user.ethAddress }
                    ],
                    [models.Sequelize.Op.and]: [
                        { pendingTargetResponse: false }
                    ]
                }
            })
            .then(function(battlesRaw) {
                return res.status(200).send(battlesRaw)
            })
    }));
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
        models.Battle.findAll({
                where: {
                    userEthAddressSource: user.ethAddress
                }
            })
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
            pendingTargetResponse: true, // are we waiting for the other player to accept/reject?
            userEthAddressSource: user.ethAddress,
            userEthAddressTarget: req.body.userEthAddressTarget,
            shapeEthAddressSource: req.body.shapeEthAddressSource,
            shapeEthAddressTarget: req.body.shapeEthAddressTarget,
            random: false
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
        user.updateAttributes({ color: req.body.color }).then(function(updatedUser) {
            return res.status(200).send(updatedUser);
        });
    });
});



////////////////////////
// Solidity Listeners //
////////////////////////


solidityAPI.on("shapeAdded" , async (shapeAddress, ownerAddress) => {
    /**
     * Update our database by getting the shape info from the blockchain and
     * entering in all the info into our database.
     * We make a new shape
     */

    const shapeData = await shapeContractData(shapeAddress);

    models.Shape.create({
        ethAddress: shapeData.address,
        userEthAddress: ownerAddress,
        color: shapeData.color,
        experience: shapeData.experience,
        level: shapeData.level
    }).then(newShape => {
        //
    }).catch(err => {
        console.log(err);
    });

});

solidityAPI.on("challengePosted" , async (sourceShape, targetShape) => {
    /**
     * create a new battle object that will represent the challenge
     * We will need to lookup who the other two shapes are owned by to get
     * all the info we need to make the battle object
     */

    models.Shape.findAll({
        where: {
            [models.Sequelize.Op.or]: [
                { ethAddress: sourceShape },
                { ethAddress: targetShape }
            ]
        }})
        .then(function(shapesRaw) {
            let sourceModel;
            let targetModel;

            // We get both shapes with the same transaction to simplify things
            if (shapesRaw.length !== 2) {
                console.log("Too many shapes returned");
                return;
            }
            else {
                if (shapesRaw[0].ethAddress === sourceShape) {
                    sourceModel = shapesRaw[0];
                    targetModel = shapesRaw[1];
                }
                else {
                    sourceModel = shapesRaw[1];
                    targetModel = shapesRaw[0];
                }
            }

            models.Battle.create({
                creationTimeUTC: new Date().getTime(),
                battleTimeUTC: null, // hasn't happened yet
                sourceWon: null, // did the source shape with the battle?
                occurred: false, // did the battle happen?
                pendingTargetResponse: true, // are we waiting for the other player to accept/reject?
                userEthAddressSource: sourceModel.userEthAddress,
                userEthAddressTarget: targetModel.userEthAddress,
                shapeEthAddressSource: sourceModel.ethAddress,
                shapeEthAddressTarget: targetModel.ethAddress,
                random: false
            }).then(() => {
                //
            }).catch(err => {
                console.log(err);
            });

        })
});

solidityAPI.on("challengeResolved" , async (sourceShape, targetShape, sourceWon) => {
    /**
     * Update the battle object that represented challenge between the two shapes
     * The battle is now over and a winner has been chosen.
     *
     * The shapes after battling will have had their experience and level updated,
     * the entries in our database will need to be updated to reflect the blockchain.
     */


    models.Battle.find({
        shapeEthAddressSource: sourceShape,
        shapeEthAddressTarget: targetShape,
    }).then(function(battle) {
        battle.sourceWon = sourceWon;
        battle.occurred = true;
        battle.pendingTargetResponse = false;
        battle.TimeUTC = new Date().getTime();

        battle.save().then(() => {}).catch(err => {
            console.log(err);
        })
    });


    updateShapeFromBC(sourceShape).catch(err => console.log(err));
    updateShapeFromBC(targetShape).catch(err => console.log(err));

});

solidityAPI.on("challengeRejected" , (sourceShape, targetShape) => {
    /**
     * Update the battle object
     * The battle is no longer pending and the battle did not happen.
     */

    models.Battle.find({
        shapeEthAddressSource: sourceShape,
        shapeEthAddressTarget: targetShape,
    }).then(function(battle) {
        battle.occurred = false;
        battle.pendingTargetResponse = false;
        battle.TimeUTC = new Date().getTime(); // Battle didn't happen, but we save when it was rejected

        battle.save().catch(err => {
            console.log(err);
        })
    });

});

solidityAPI.on("randomPosted" , (shapeAddress) => {
    /**
     * Update the shape to show that it is seeking a random battle
     */

    models.Shape.find({
        ethAddress: shapeAddress
    }).then(shape => {
        shape.seekingRandom = true;

        shape.save().catch(err => {
            console.log(err);
        })

    }).catch(err => console.log(err));

});

solidityAPI.on("randomResolved" , async (winnerShapeAddress, loserShapeAddress) => {
    /**
     * Create a new battle object to record the random battle that occurred
     * Update both shapes data in our database to reflect blockchain updates
     */


    const bcWinnerShapeData = await shapeContractData(winnerShapeAddress);
    const bcLoserShapeData = await shapeContractData(loserShapeAddress);

    models.Battle.create({
        creationTimeUTC: new Date().getTime(),
        battleTimeUTC: new Date().getTime(),
        sourceWon: true, // For random battles the winner will be the source
        occurred: true,
        pendingTargetResponse: false,
        userEthAddressSource: bcWinnerShapeData.owner,
        userEthAddressTarget: bcWinnerShapeData.address,
        shapeEthAddressSource: bcLoserShapeData.owner,
        shapeEthAddressTarget: bcLoserShapeData.address,
        random: true
    }).catch(err => {
        console.log(err);
    });

    updateShapeFromBC(winnerShapeAddress).catch(err => { console.log(err); });
    updateShapeFromBC(loserShapeAddress).catch(err =>  { console.log(err); });

});


// Todo: This interface needs to be the actual shape interface!
const shapeInterface = {};

async function shapeContractData(address) {
    let shapeData = {address: address};
    let colorInt;

    const shapeContract = new Shape(address);

    // See https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8
    // These need to line up from top to bottom!
    [
        shapeData.owner,
        shapeData.level,
        shapeData.experience,
        shapeData.seekingRandom,
        colorInt
    ] = await Promise.all([
        shapeContract.owner(),
        shapeContract.level(),
        shapeContract.experience(),
        shapeContract.awaitingRandomFight(),
        shapeContract.rgbColor()
    ]);

    shapeData.color = colorInt.toString(16);

    return shapeData;
}

async function updateShapeFromBC(shapeAddress) {

    const bcShapeData = await shapeContractData(shapeAddress);


    models.Shape.find({
        ethAddress: shapeAddress
    }).then((shape) => {
        shape.experience = bcShapeData.experience;
        shape.level = bcShapeData.level;
        shape.color = bcShapeData.color;
        shape.seekingRandom = bcShapeData.seekingRandom;

        shape.save().then( () => {}).catch(err => {
            console.log(err);
        });

    }).catch(err => {
        console.log(err);
    })

}

/////////////
// Helpers //
/////////////

// GET All users (Helper Method)
app.get('/users', function(req, res) {
    console.log('');
    console.log('Get Users..');

    authenticateRequest(req, res, user => {
        models.User.findAll()
            .then(function(users) {
                return res.status(200).send(users);
            });
    });
});

app.get('/tables', function(req, res) {
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
app.post('/drop', function(req, res) {
    console.log('');
    console.log('Drop Tables..');

    models.sequelize.sync({ force: true })
        .then(response => {
            res.send('dropped');
        });
});


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

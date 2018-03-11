const express = require('express');
var router = express.Router();

///////////
// Users //
///////////

app.post('/verify', (req, res) => {
    console.log('');
    console.log('Verify user..');

    models.User
        .findOne({ where: { verifyCode: req.body.code } })
        .then(user => {
            if (!user) {
                console.log('Invalid verify code..');
                return res.status(400).json({ error: 'Invalid verify code' });
            }
            // Update the user
            user.updateAttributes({ verified: true }).then((updatedUser) => {

                // Set the user cookie
                let token = jwt.sign({
                    email: user.email,
                    password: user.password
                }, process.env.TOKEN_SECRET, {
                    expiresIn: '30d' // expires in 24 hours
                });
                res.cookie('token', token, {
                    expires: token.expiresIn,
                    httpOnly: false
                });

                res.redirect('/dashboard.html');
            });
        });
});


// Called by sign up page
app.post('/join', async(req, res) => {

    console.log('');
    console.log('New User..');

    let {
        body: {
            email,
            password
        }
    } = req;

    // Validate email and password (maybe do some extra sterilizing here..)
    if (email === '' || email === undefined) {
        return res.status(400).json({ success: false, error: 'Invalid email.' });
    }
    if (password === '' || password === undefined) {
        return res.status(400).json({ success: false, error: 'Invalid password.' });
    }

    // Create and store User
    createUser(req, res, email, password, (newUser) => {
        console.log('User added: ' + newUser.email);
        console.log('redirect..');
        return res.redirect('/verify.html');
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
        user.updateAttributes({ color: req.body.color }).then((updatedUser) => res.status(200).send(updatedUser));
    });
});

// GET All users (Helper Method)
app.get('/users', (req, res) => {
    console.log('');
    console.log('Get Users..');

    authenticateRequest(req, res, user => {
        models.User
            .findAll()
            .then((users) => res.status(200).send(users));
    });
});


module.exports = router
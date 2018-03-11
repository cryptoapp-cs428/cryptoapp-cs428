const express = require('express');
var router = express.Router();


const auth = require('./authentication');

/////////
// API //
/////////

router.post('/login', (req, res) => {
    console.log('');
    console.log('login tried..');
    console.dir(req.body);

    // search for attributes
    models.User.findOne({ where: { email: req.body.email } }).then(user => {

        // If email doesn't exist
        if (!user) {
            res.status(401).json({ error: 'email doesnt exist' });
            return;
        }

        console.log('password hash:');
        console.log(user.passwordHash);

        // Check their password with our stored hash
        bcrypt.compare(req.body.password, user.passwordHash, function(err, authenticated) {
            // Invalid password
            if (!authenticated) {
                return res.status(401).json({ error: 'invalid password' });
            }

            // User has logged in
            let token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET, {
                expiresIn: '30d' // expires in x days
            });

            // Set their cookie
            res.cookie('token', token, {
                expires: token.expiresIn,
                httpOnly: false
            });

            return res.redirect('/dashboard.html');
        });
    });
});

router.get('/logout', (req, res) => {
    console.log('');
    console.log('logout tried..');

    res.clearCookie('token');

    return res.status(200).redirect('/login');
});


router.get('/animals', auth.authMiddleWare, (req, res) => {
    console.log('');
    console.log('Get Animals..');

    // res.locals._user will give the user if needed

    models.Animal.findAll()
        // models.Animal.findAll({where: {
        //   userId: user.id
        // }})
        .then((animalsRaw) => {
            // Grab just the date and the count
            // let animals = animalsRaw.map((animal) => { return {date: animal.date, color: animal.color}});
            return res.status(200).send(animalsRaw);
        });

});

router.post('/animals', (req, res) => {
    console.log('');
    console.log('Post Animals..');
    console.log('Name: ' + req.body.name);

    authenticateRequest(req, res, user => {
        if (!user) { return res.redirect('/login.html') }

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




/////////////
// Helpers //
/////////////



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
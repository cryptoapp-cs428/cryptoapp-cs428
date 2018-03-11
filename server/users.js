const createUser = (req, res, email, password, cb) => {

    console.log('createUser..');
    // Check if user exists
    models.User.findAndCountAll({ where: { email: email } })
        .then(result => {

            if (result.count > 0) {
                console.log('..email already exists');
                return res.status(400).json({ success: false, reason: 'EMAIL_ALREADY_EXISTS' });;
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
                        html: `<html><p>Hello,<br> Please enter this code ${verifyCode} to verify your email.</p></html>`,
                        text: `Please enter this code ${verifyCode} to verify your email.`
                    };
                    // html: `<p>Hello,<br> Please <a href=${verifyCode}>click here</a> to verify your email.</p><br/>
                    // or enter this code ${verifyCode}`,
                    transporter.sendMail(emailOptions, (error, info) => {
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
                    }).then((newUser) => {

                        console.log('..user created');

                        // User has logged in
                        let token = jwt.sign({ email: newUser.email }, process.env.TOKEN_SECRET, {
                            expiresIn: '1d' // expires in 24 hours
                        });

                        res.cookie('token', token, {
                            expires: token.expiresIn,
                            httpOnly: false
                        });

                        cb(newUser);
                    });
                });
            }
        });
}

module.exports = { createUser }
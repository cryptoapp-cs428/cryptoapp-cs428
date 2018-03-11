const authenticateRequest = (req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;

    // Check if token exists
    if (!token) {
        console.log('User didnt provide token..');
        res.redirect('/login.html');
    }

    // Verify it
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log('Invalid login token..');
            // Maybe just wanna do a redirect here instead of sending a page? 
            res.sendFile(path.join(__dirname + '/public/login.html'));
        } else {

            // Find the user associated with this email
            models.User.findOne({ where: { email: decoded.email } }).then(user => {
                if (!user) {
                    // invalid user login
                    console.log('Invalid login email..');
                    return res.redirect('/login.html');
                } else if (!user.verified) {
                    return res.redirect('/verify.html');
                } else {
                    res.locals._user=user;
                    next();
                }
            });
        }
    });
}


module.exports = {
    authMiddleWare: authenticateRequest
}
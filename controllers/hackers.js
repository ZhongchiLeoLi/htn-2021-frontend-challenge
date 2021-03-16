const Hacker = require('../models/hacker');

// Export Sign Up page
module.exports.signUpForm = (req, res) => {
    res.render('hackers/signup');
}

// Sign up a new hacker
module.exports.signUp = async(req,res, next) => {
    try {
        // Create a new Hacker by destrucuring parameters from req.body
        const {username, password} = req.body;
        const hacker = new Hacker({username});

        // Hash the password and store the salt of the new hacker with Passport.js's register function
        const registeredHacker = await Hacker.register(hacker, password);

        // Log in the hacker after registering
        req.login(registeredHacker, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Hack the North Events!');
            res.redirect('/events');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('signup');
    }
}

// Export Login form
module.exports.loginForm = (req, res) => {
    res.render('hackers/login');
}

// Log in a hacker
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');

    // If users was previously on an event page, redirect them back to that page
    const redirectUrl = req.session.returnTo || '/events';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// Log a hacker out
module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success', 'See you next time!')
    res.redirect('/events');
}
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const hackers = require('../controllers/hackers');

router.route('/signup')
    .get(hackers.signUpForm)
    .post(catchAsync(hackers.signUp))

router.route('/login')
    .get(hackers.loginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), hackers.login)

router.get('/logout', hackers.logout)

module.exports = router;
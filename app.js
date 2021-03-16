// Import environment variables from .env file while in development mode
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Require node packages, models, and other tools
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const Hacker = require('./models/hacker')

// Require routes
const hackerRoutes = require('./routes/hackers')
const eventRoutes = require('./routes/events');

// Set up view engine and directory for easier file path navigation
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));


// Connect to MongoDB
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true
})
.then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
}).catch((err) => {
    console.log("OH NO! MONGO CONNECTION ERROR!!!");
    console.log(err);
});

// configure express session and storing it on MongoDB
const secret = process.env.SECRET;
const sessionConfig = {
    store: MongoStore.create({ 
        mongoUrl: dbUrl,
        touchAfter: 24*60*60
     }), 
    name: 'sessionConfig',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

// Set up session, flash, and passport
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(Hacker.authenticate()))
passport.serializeUser(Hacker.serializeUser());
passport.deserializeUser(Hacker.deserializeUser());

// Middleware for flashing messages
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // store the user if there is one logged in
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Use routes
app.use('/', hackerRoutes);
app.use('/events', eventRoutes);

// Redirect all other routes as error to the error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

// Error handler
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Uh oh, something went wrong...';
    res.status(statusCode).render('error', {err});
})

// Listen to port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})
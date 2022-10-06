require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User.js');
var passport = require('passport');
const session = require('express-session');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

// MIDDLEWARE
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use(
  session({
    secret: 'messidagoat',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/redirect',
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { username: profile.displayName, googleId: profile.id },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

// CONNECT TO MONGODB ATLAS CLUSTER
try {
  const uri = process.env.MONGODB_CLIENT_ID;
  mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => console.log('Connected to Mongo Cluster!')
  );
} catch (error) {
  console.error(error);
}

// AUTH ROUTES
app.get('/auth/login/success', function (req, res) {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: 'successful',
      user: req.user,
    });
  }
});

app.get('/auth/login/failed', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'login failure',
  });
});

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get(
  '/auth/google/redirect',
  passport.authenticate('google', {
    failureRedirect: '/login/failed',
  }),
  function (req, res) {
    res.redirect('http://localhost:3000/dashboard');
  }
);

app.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) err;
    res.redirect('http://localhost:3000/');
  });
});

app.listen(5000, () => {
  console.log('Server listening on port 5000!');
});

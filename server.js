require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User.js');
var passport = require('passport');
const session = require('express-session');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

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

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get(
  '/auth/google/redirect',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/',
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

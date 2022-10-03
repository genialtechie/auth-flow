const express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
const app = express();

app.get('/login/google', (req, res) => {
  res.send('Hello World!');
});

app.listen(5000, () => {
  console.log('Server listening on port 5000!');
});

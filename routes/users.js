const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => res.render('login'));

// Register page
router.get('/register', (req, res) => res.render('register'));

// Handle Register
router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  let errors = [];

  // Check for required fields
  if (!name || !email || !password || !confirmPassword)
    errors.push({ msg: 'Please fill in all fields' });

  // Check for password match
  if (password !== confirmPassword)
    errors.push({ msg: 'Passwords do not match' });

  //   Check for password length
  if (password.length < 6)
    errors.push({ msg: 'Password must be at least 6 characters' });

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword,
    });
  } else {
    // Check if user already exists
    User.findOne({ email: email }).then((user) => {
      // If user already exists
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          confirmPassword,
        });
      }
      // If user not exists
      else {
        // Create new user
        const newUser = new User({
          name,
          email,
          password,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed password
            newUser.password = hash;
            // Save user to database
            newUser.save().then((user) => {
              req.flash('success_msg', 'You are now registered and can log in');
              res.redirect('/users/login');
            });
          })
        );
      }
    });
  }
});

// Handle Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Handle logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;

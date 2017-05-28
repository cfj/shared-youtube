const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Todo: använd async await här
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, function(token, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne({ 'google.id': profile.id }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (user) {
        return done(null, user);
      } else {
        var newUser = new User();
        newUser.google = extractProfile(profile, token);

        newUser.save(function(err) {
          if (err) {
            throw err;
          }

          return done(null, newUser);
        })
      }
    });
  });
}));

function extractProfile(profile, token) {
  let imageUrl = '';

  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }

  return {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    profileImageUrl: imageUrl,
    token
  };
}
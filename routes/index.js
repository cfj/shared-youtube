const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const { catchErrors } = require('../handlers/errorHandlers');
const passport = require('passport');

router.get('/', catchErrors(mainController.homePage));

router.post('/api/video', mainController.isLoggedIn, catchErrors(mainController.storeVideo));
router.get('/api/videos/latest', catchErrors(mainController.getLatestVideo));

router.post('/api/event', mainController.isLoggedIn, catchErrors(mainController.storeEvent));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

router.get('/oauth/google/callback/', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/'
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

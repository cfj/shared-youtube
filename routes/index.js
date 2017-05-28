const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const { catchErrors } = require('../handlers/errorHandlers');
const passport = require('passport');

// Do work here
router.get('/', catchErrors(mainController.homePage));

router.post('/api/video', catchErrors(mainController.storeVideo));
router.get('/api/videos/latest', catchErrors(mainController.getLatestVideo));

router.post('/api/event', catchErrors(mainController.storeEvent));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

router.get('/oauth/google/callback/', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/'
}));

module.exports = router;

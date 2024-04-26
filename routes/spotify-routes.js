const express = require('express');


const router = express.Router();

const spotifyController = require('../controllers/spotify-controller');


// Routes

router.get('/login', spotifyController.getSpotifyLogin);

router.get('/callback', spotifyController.getSpotifyCallback);

router.get('/check-auth', spotifyController.getCheckAuth);

module.exports = router;
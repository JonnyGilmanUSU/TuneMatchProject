// Define Spotify App
const SpotifyWebApi = require('spotify-web-api-node');
// Import spotify credentials securely
require('dotenv').config();

// Define Spotify App
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

module.exports = spotifyApi;
const spotifyApiConfig = require('../util/spotifyApi');
const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../models/userModel');
const { access } = require('fs');
require('dotenv').config();


exports.getSpotifyLogin = (req,res) => {
    try{
        const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state', 'user-library-modify']
        const authUrl = spotifyApiConfig.createAuthorizeURL(scopes); //Creates Spotify Auth Url
        res.json({ authUrl: authUrl}) //Sends URL to front end to be rendered there
        console.log('Login Initiation Success')
    } catch (err) {
        console.log('Login Initiation Error:   ', err)
    }
}


exports.getSpotifyCallback = async (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    console.log("Past Code")

    if(error){
        console.log('Error: ', error);
        res.send(`Error: ${error}`);
        return;
    }

    // Get spotify tokens from authorization code grant
    spotifyApiConfig.authorizationCodeGrant(code)
        .then(data => {
            const accessToken = data.body['access_token'];
            const refreshToken = data.body['refresh_token'];
            const expiresIn = data.body['expires_in'];

            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            req.session.expiresIn = expiresIn;

            // Set the access token for this instance
            spotifyApiConfig.setAccessToken(accessToken);
            spotifyApiConfig.setRefreshToken(refreshToken);

            console.log(`The token expires in ${expiresIn} seconds.`);
            console.log(`The access token is ${accessToken}`);
            console.log(`The refresh token is ${refreshToken}`);

            res.redirect('http://localhost:3001/');
            // res.redirect(process.env.FRONTEND_URL);
            console.log('Get Callback Authorization Success')

            setInterval(async () => {
                const data = await spotifyApiConfig.refreshAccessToken();
                const accessToken = data.body['access_token'];
            
                console.log('The access token has been refreshed!');
                console.log(`The new access token is ${accessToken}`);
                spotifyApiConfig.setAccessToken(accessToken);
                }, expiresIn / 2 * 1000);
        }).catch(error => {
            console.log('Error Getting Tokens:  ', error);
            res.send(`Error getting Tokens: ${error}`);
        });
}
// Check to see if user is authenticated
// New route to check if the user is authenticated
exports.getCheckAuth = async (req, res) => {
    try {
        console.log("getAuthCheck start")

        // Get the Spotify user ID from the session
        const accessToken = req.session.accessToken;
        console.log("Accesstoken: ", accessToken)

        if (!accessToken) {
            // If there's no Spotify user ID, user is not authenticated and front end will not update state to allow user input
            console.log("No spotify User Id: Authentication failed")
            return res.json({ authenticated: false });
        }

        // If user exists in the database and there's a valid access token in the session, return authenticated
        console.log("User authenticated");
        return res.json({ authenticated: true });
    } catch (err) {
        console.error("Error during getCheckAuth:", err);
        return res.status(500).send("Internal Server Error");
    }
};






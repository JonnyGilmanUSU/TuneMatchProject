const spotifyApiConfig = require('../util/spotifyApi');
const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../models/userModel');
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

    try {

        // Get spotify tokens from authorization code grant
        const data = await spotifyApiConfig.authorizationCodeGrant(code);
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        console.log("ACCESS TOKEN:  ", accessToken);
        console.log("REFRESH TOKEN: ", refreshToken);


        // Create a new Spotify API instance with client credentials and the user's access token
        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.CLIENT_ID, // Use your client ID
            clientSecret: process.env.CLIENT_SECRET, // Use your client secret
            redirectUri: process.env.REDIRECT_URI, // Use your redirect URI
        });

        // Set the access token for this instance
        spotifyApi.setAccessToken(accessToken);

        // Fetch the current user's profile with the access token
        const userProfile = await spotifyApi.getMe();
        const spotifyUserId = userProfile.body.id;

        // Store the Spotify user ID in the session (persisted in MongoDB)
        req.session.spotifyUserId = spotifyUserId; // Store the ID in session

        console.log("Spotify User ID before findOne:", spotifyUserId); // Ensure it's the correct ID

        // Check if the user already exists in the database
        let user = await User.findOne({ spotifyUserId: spotifyUserId });

        if (!user) {
            console.log("No user found. Creating a new user..."); // Should execute if no user is found
            // Create a new user with the fetched tokens and user ID
            newUser = new User({
                spotifyUserId,
                accessToken,
                refreshToken,
                expiresIn,
            });
            await newUser.save();
            console.log("New User created successfully")
        } else {
            // Update the existing user's tokens
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.expiresIn = expiresIn;
            
            await user.save();
            console.log("User Updated")
        }

        console.log('Get Callback Authorization Success')

        // Redirect to front end after authentication is done
        // Should be front end url with / at the end
        
        res.redirect('http://localhost:3001/');
        // res.redirect(process.env.FRONTEND_URL);


        // Schedule token refresh
        setInterval(async () => {
            try {
                const refreshData = await spotifyApi.refreshAccessToken();
                const refreshedAccessToken = refreshData.body['access_token'];

                user.accessToken = refreshedAccessToken;
                await user.save(); // Update the access token in MongoDB
            } catch (refreshErr) {
                console.error('Error refreshing access token:', refreshErr);
            }
        }, expiresIn / 2 * 1000); // Refresh token halfway through the expiration time
    } catch (err) {
        console.error('Error during Spotify callback:', err);
        res.status(500).send('Error getting token');
    }
};

// Check to see if user is authenticated
// New route to check if the user is authenticated
exports.getCheckAuth = async (req, res) => {
    try {
        console.log("getAuthCheck start")

        // Get the Spotify user ID from the session
        const spotifyUserId = req.session.spotifyUserId; // This should be in MongoDB session
        console.log("spotifyUserId pulled from session")

        if (!spotifyUserId) {
            // If there's no Spotify user ID, user is not authenticated and front end will not update state to allow user input
            console.log("No spotify User Id: Authentication failed")
            return res.json({ authenticated: false });
            
        }
        // Find the user in the database by their Spotify user ID
        const user = await User.findOne({ spotifyUserId });
        console.log("Found user in database by their spotifyId: ", user)

        if (user && user.accessToken) {
            // If the user exists and has an access token, they are authenticated
            console.log("User and user.accesstoken: authenticated = true")
            return res.json({ authenticated: true });
        } else {
            // If no user or no access token, user is not authenticated
            console.log("User and user.accesstoken: authenticated = false")
            return res.json({ authenticated: false });
        }
    } catch (err) {
        console.log("Error in getCheckAuth");
        console.error("Error in getCheckAuth:", err);
        return res.status(500).send("Internal Server Error");
    }

};






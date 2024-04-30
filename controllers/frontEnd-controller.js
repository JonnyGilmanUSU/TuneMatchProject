const spotifyApi = require('../util/spotifyApi');
const User = require('../models/userModel');
const SpotifyWebApi = require('spotify-web-api-node');

function truncateString(str) {
    if (str.length > 17) {
        return str.slice(0) + '...';
    } else {
        return str;
    }
}


exports.postSearchValue = async (req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).send('Authentication required. Please log in.');
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(req.session.accessToken);
    try {
        const { searchValue } = req.body;
        console.log("Search Value: ", searchValue)

    

        // Search request to API to get song ID
        const searchResponse = await spotifyApi.searchTracks(searchValue, {limit: 1});
        const trackId = searchResponse.body.tracks.items[0].id;
        console.log("TrackId:   ", trackId)

        // // Look up track and get track info
        const getTrackResponse = await spotifyApi.getTrack(trackId);

        // // Gather specific data to be sent to front end to display
        const trackData = {
            trackAlbumName: getTrackResponse.body.album.name,
            trackName: getTrackResponse.body.name,
            // trackArtistName: getTrackResponse.body.artist[0].name,
            // trackAlbumArt: getTrackResponse.body.album.images[0].url
        }
        console.log("Track Data:    ", trackData)

        // Get spotifty recommendations based on ID
        const recResponse = await spotifyApi.getRecommendations({ seed_tracks: [trackId], limit: 1});
        const recTrack = recResponse.body.tracks[0];
        // Extract relevant information from reccomendation
        const recData = {
            recTrackName: truncateString(recTrack.name),           
            recAlbumName: truncateString(recTrack.album.name),
            recArtistName: truncateString(recTrack.artists[0].name), // Assuming you want the first artist
            recAlbumArt: recTrack.album.images[0].url,
            recTrackUri: recTrack.uri,
            recTrackId: recTrack.id
        };

        console.log("recData:   ", recData)


        // Send Track Data to Front End!
        res.send({ trackData, recData });

    } catch(err) {
        console.log(err)
        if(err.statusCode === 401) {
            // Assume token expired, refresh it
            try {
                const data = await spotifyApi.refreshAccessToken();
                req.session.accessToken = data.body['access_token'];
                spotifyApi.setAccessToken(req.session.accessToken);

                // Retry the request by calling this function recursively
                return exports.postSearchValue(req, res, next);
            } catch (refreshError) {
                console.error('Error refreshing Tokens:', refreshError);
                return res.status(401).send('Session expired. Please log in again.');
            }
        }
        return res.status(500).send('An error occurred while processing your request.');
    }
};

exports.postSearchSuggestions = async (req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).send('Authentication required. Please log in.');
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(req.session.accessToken);

    // Retreive search term from front end
    const { searchTerm } = req.body;    
    console.log("Backend Search Value:  ", searchTerm);

    try {
        const suggestionResponse = await spotifyApi.searchTracks(searchTerm, { limit: 4 });
        const suggestions = suggestionResponse.body.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            albumArt: track.album.images[0].url
        }));
        
        res.json({ suggestions })
    } catch (error) {
        console.error("Error fetching search suggestions: ", error);
        if (error.statusCode === 401) {
            // Token might have expired, try to refresh it
            try {
                const data = await spotifyApi.refreshAccessToken();
                req.session.accessToken = data.body['access_token'];
                spotifyApi.setAccessToken(req.session.accessToken);

                // Retry the request by calling this function recursively
                return exports.postSearchSuggestions(req, res, next);
            } catch (refreshError) {
                console.error('Error refreshing Tokens:', refreshError);
                return res.status(401).send('Session expired. Please log in again.');
            }
        }
        res.status(500).send({ error: "Failed to fetch search suggestions" });
    }
}

exports.playSong = async (req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).send('Authentication required. Please log in.');
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(req.session.accessToken);

    try {
        const spotifyUserId = req.session.spotifyUserId;
        const user = await User.findOne({ spotifyUserId });

        // Retreive access token from session
        const accessToken = req.session.accessToken;
        spotifyApi.setAccessToken(accessToken);

        const { trackUri } = req.body;
      
        // Check if a valid track URI is provided
        if (!trackUri) {
            return res.status(400).send({ error: "No track URI provided" });
        }

        const response = await spotifyApi.getMyDevices();
        const activeDevice = response.body.devices.find(device => device.is_active);

        if (!activeDevice) {
            console.log("You don't have an active device. Open your Spotify app to add this song to your playlist.");
            return;        }

        // Start playback using the track URI
        await spotifyApi.play({
            uris: [trackUri],
            device_id: activeDevice.id,
        });

        console.log("Playing Song")
    } catch (error) {
        console.log("Error in playing song: ", error)
        res.status(500).send({ error: "An error occurred while playing the song." });
    }
}

exports.likeSong = async (req, res, next) => {
    try {
        const spotifyUserId = req.session.spotifyUserId;
        const user = await User.findOne({ spotifyUserId });
        // Retreive access token from session
        const accessToken = req.session.accessToken;
        spotifyApi.setAccessToken(accessToken);

        const { trackId } = req.body;

        if (!trackId) {
            console.log("Cant get trackId")
            return res.status(400).send({ error: "No track ID provided" });
        }

        const response = await spotifyApi.getMyDevices();
        const activeDevice = response.body.devices.find(device => device.is_active);

        if (!activeDevice) {
            console.log("You don't have an active device. Open your Spotify app to add this song to your playlist.");
            return;
        }
        
        await spotifyApi.addToMySavedTracks([trackId]);
        res.status(200).send({ message: "Song added to your liked tracks." });
        console.log("Liked Song")


    } catch (error) {
        console.log("Error in playing song: ", error)
        res.status(500).send({ error: "An error occurred while liking the song." });
    }
}


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    spotifyUserId: {
        type: String,
        required: true,
        unique: true, // Ensures there's only one record per Spotify user ID
      },
});
module.exports = mongoose.model('User', userSchema);

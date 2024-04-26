import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// Contexts
import { useTrackData } from "../../util/TrackDataContext";
// Css
import MusicPlayerStyles from "./MusicPlayer.module.css";
// Assets
import TimeBar from '../../assets/icons/play-bar.svg';
import LikeSong from '../../assets/icons/like-song.svg';
import PauseButton from '../../assets/icons/pause-button.svg';
import Chevron from '../../assets/icons/chevron.svg';
import More from '../../assets/icons/more.svg';
import ThumbsUp from '../../assets/icons/thumbs-up.svg';
import ThumbsDown from '../../assets/icons/thumbs-down.svg';
import LikedSong from '../../assets/icons/liked.svg';






function MusicPlayer () {
    // Fetch context data
    const { recData  } = useTrackData();
    const trackUri = recData.recTrackUri;  
    const trackId = recData.recTrackId;  

    // State management
    const [isLiked, setIsLiked] = useState(false);
  
  // PLAY SONG EACH TIME PAGE LOADS
    useEffect(() => {
      if (recData) {
        playSong(trackUri);
      }
    }, [recData]);

    // PLAY SONG REQUEST
    const playSong = async (trackUri) => {
      try {
        const response = await axios.post('https://tunematchproject.onrender.com/play', { trackUri });
        // const response = await axios.post('/play', { trackUri });
        console.log("Playback Started", response.data)
      } catch (error) {
        console.log("Error playing Song:  ", error)
      }
    };

    // Like Song Request
    const likeSongHandler = async (trackId) => {
      setIsLiked(!isLiked);
      console.log("LIKE CLICKED")
      try {
        const response = await axios.post('https://tunematchproject.onrender.com/postSearchValue', { trackId });
        // const response = await axios.post('/likeSong', { trackId });
        console.log("Liked Song")
      } catch (error) {
        console.error('Error liking the song:', error);
      }
    }


    if (!recData) {
      // Optionally handle the case where recData is null
      // But ideally, this component is only rendered when recData is available
      console.log("REC DATA IS NULL ):")
      return null;
    }    


    const dynamicBackgroundStyle =  {
      backgroundImage: `url(${recData.recAlbumArt})`,
      backgroundSize: 'cover',
      filter: 'blur(50px)',
      transform: 'scale(3)',
      position: 'absolute', // Ensure it covers the container
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: '-1', // Keep it behind all content
      // other styles
    } 

    

    
  return (
    <div className={MusicPlayerStyles['musicPlayerContainer']}>
      {/* Background layer for blur effect */}
      <div style={dynamicBackgroundStyle}></div>
      {/* Content layer */}
      <div className={MusicPlayerStyles['recommendation-wrapper']} > 
        <div className={MusicPlayerStyles['red-gradient']}>
          <div className={MusicPlayerStyles['light-gradient']}>
            <div className={MusicPlayerStyles['front-layer']}>
                <img className={MusicPlayerStyles['album-cover']} src={recData.recAlbumArt} alt="album cover" />
                <div className={MusicPlayerStyles['white-album-cover']}></div>
                <img className={MusicPlayerStyles['time-bar']} src={TimeBar} />
                {isLiked && 
                  <img 
                  className={MusicPlayerStyles['liked-song']} 
                  src={LikedSong} 
                />
                }
                {!isLiked &&
                    <img 
                    className={MusicPlayerStyles['like-song']} 
                    onClick={() =>likeSongHandler(trackId)} 
                    src={LikeSong} 
                  />
                }

                <img className={MusicPlayerStyles['time-bar']} src={TimeBar} />
                <img className={MusicPlayerStyles['pause-button']} src={PauseButton} />
                <img className={MusicPlayerStyles['chevron-button']} src={Chevron} />
                <img className={MusicPlayerStyles['more-button']} src={More} />
                <img className={MusicPlayerStyles['thumbs-up']} src={ThumbsUp} />
                <img className={MusicPlayerStyles['thumbs-down']} src={ThumbsDown} />
                <h2 className={MusicPlayerStyles['song']}>{recData.recTrackName}</h2>
                <p className={MusicPlayerStyles['artist']}>{recData.recArtistName} </p>
                <p className={MusicPlayerStyles['album']}>{recData.recAlbumName}</p>
                <div className={MusicPlayerStyles['oval-container']}>
                <div className={MusicPlayerStyles['oval']}>
                  <Link to="/"><p>New Recommendation</p></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  
  )
};

export default MusicPlayer;



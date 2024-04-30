import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTrackData } from '../../util/TrackDataContext';
import { useLoading } from '../../util/LoadingContext';
import HomeStyles from "./Home.module.css";
// import backendRequest from '../../util/BackendRequest';

const Home = () => {
    // Input value for Search Bar
    const [searchValue, setSearchValue] = useState('');
    // State variable for suggestions
    const [suggestions, setSuggestions] = useState([]);
    // State for search icon
    const [isFocused, setIsFocused] = useState(true); // State to track focus
    // State Variable for Get Started and Search Bar
    const [getStarted, setGetstarted] = useState(true);


    // TrackContext Function
    const { updateTrackData, updateRecData } = useTrackData('');
    // Loading Context
    const { setIsLoading, isLoading } = useLoading(); // Assuming you have this from

    useEffect(() => {
        // Runs auth function to check if authenticated
        checkAuthentication();
    }, []);

    const handleFocus = () => {
        setIsFocused(false);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const checkAuthentication = async () => {
        try {
            // const response = await axios.get('https://tunematchproject.onrender.com/spotify/check-auth');
            const response = await axios.get('/spotify/check-auth');

            if (response.data.authenticated) {
                setGetstarted(false); // If authenticated, hide the "Get Started" button
            }
        } catch (error) {
            console.log('Error checking authentication:', error);
        }
    };

    const onChangeHandler = (event) => {
        const searchTerm = event.target.value;
        setSearchValue(searchTerm);

        if (searchTerm.length > 1) {

            // const response = axios.post('https://tunematchproject.onrender.com/searchSuggestions', { searchTerm })
            axios.post('/searchSuggestions', { searchTerm })
            .then(response => {
                setSuggestions(response.data.suggestions);
                // console.log('searchTerm', response.data.suggestions)
            })
            .catch(error => console.log('Error fetching suggestions:    ', error));
            console.log(suggestions)
        } else {
            setSuggestions([]);
        }

    };

    // Submit handler for search Button
    const searchHandler = async () => {
        setIsLoading(true);
        try {
            // const response = await axios.post('https://tunematchproject.onrender.com/postSearchValue', { searchValue })
            const response = await axios.post('/postSearchValue', { searchValue });
            // Update Track and Rec Data in Context
            updateTrackData(response.data.trackData);
            updateRecData(response.data.recData)
            
            console.log("Track Data:    ", response.data.trackData);
        } catch (error) {
            console.log('Error: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStartedHandler = async () => {
        try{
            // const loginResponse = await axios.get('https://tunematchproject.onrender.com/spotify/login');
            const loginResponse = await axios.get('/spotify/login');
            console.log("Response from login:", loginResponse.data);  // Log to check what you receive


            // redirect to spotify login page
            const spotifyAuthUrl = loginResponse.data.authUrl;
            window.location.href = spotifyAuthUrl;
            console.log("Spotify auth URL:  ", spotifyAuthUrl)
        } catch(err) {
            console.log('Get Started Error: ', err)
        }
    };

  return (
    <div className={HomeStyles['home-background']}>
    <div className={HomeStyles.wrapper}>
        <div className={HomeStyles.container}>
            <div className={HomeStyles['home-text']}>
            <h1 className={HomeStyles['header-font']}>Tune <span className={HomeStyles['bold']}>Match</span></h1>
                <p className={HomeStyles['text-font']}>Tell us what you're looking for. Simply type in the name of the song you like and we'll provide you with tailored recommendations.</p>
                {getStarted ? (
                    <button className={HomeStyles['button']} onClick={getStartedHandler}>Get Started</button>
                ) : (
                    <div className={HomeStyles['input-container']}>
                        <input 
                            type="text"
                            onBlur={handleBlur}
                            value={searchValue}
                            placeholder='Enter Song...'
                            onChange={onChangeHandler}
                        />
                        {suggestions.length > 0 && (
                            <ul className={HomeStyles['suggestion-list']}>
                            {suggestions.map((suggestion) => (
                                <li 
                                    key={suggestion.id} 
                                    className={HomeStyles['suggestion-item']}
                                    onClick={() => {setSearchValue(suggestion.name); setSuggestions([]); handleFocus() }}>
                                    
                                    <img 
                                        className={HomeStyles['suggestion-album']} 
                                        src={suggestion.albumArt} 
                                        alt="album cover" 
                                    />
                                    <div className={HomeStyles['suggestion-details']} >
                                        <p className={HomeStyles['suggestion-details-name']} >{suggestion.name}</p>
                                        <p className={HomeStyles['suggestion-details-artist']} >{suggestion.artist}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        )}
                        <Link to="/recommendation" onClick={searchHandler}>
                        {!isFocused && (
                            <svg class={HomeStyles['search-icon']} viewBox="0 0 20 20">     
                                 <path d="M15.7 14.3L11.5 10.1C11.3 9.9 11 9.8 10.7 9.8C11.5 8.8 12 7.4 12 6C12 2.7 9.3 0 6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C7.4 12 8.8 11.5 9.8 10.6C9.8 10.9 9.8 11.2 10.1 11.4L14.3 15.6C14.5 15.8 14.8 15.9 15 15.9C15.2 15.9 15.5 15.8 15.7 15.6C16.1 15.3 16.1 14.7 15.7 14.3ZM6 10.5C3.5 10.5 1.5 8.5 1.5 6C1.5 3.5 3.5 1.5 6 1.5C8.5 1.5 10.5 3.5 10.5 6C10.5 8.5 8.5 10.5 6 10.5Z" fill="#1C2E45" fill-opacity="0.6"/>
                                 <path viewBox="0 0 8" fill="none" xmlns="http://www.w3.org/2000/svg"></path>
                             </svg>
                                )}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    </div>
    </div>

  )
} 



export default Home;
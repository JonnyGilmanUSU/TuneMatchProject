// TrackDataContext.js
import React, { createContext, useState, useContext } from 'react';

const TrackDataContext = createContext();

export const useTrackData = () => useContext(TrackDataContext);

export const TrackDataProvider = ({ children }) => {
    const [trackData, setTrackData] = useState(null);
    const [recData, setRecData] = useState(null);

    const updateTrackData = (newTrackData) => {
        setTrackData(newTrackData);
    };

    const updateRecData = (newRecData) => {
        setRecData(newRecData);
        console.log("REC DATA IN CONTEXT:   ", recData)
    };



    return (
        <TrackDataContext.Provider value={{ 
            trackData, updateTrackData, 
            recData, updateRecData,
         
        }}>
            {children}
        </TrackDataContext.Provider>
    );
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Context
import { useLoading } from '../util/LoadingContext';
// Pages
import HomePage from '../pages/HomePage';
import LoadingIndicator from '../components/Loading/Loading';
import MusicPlayer from '../components/Recommendation/MusicPlayer';

function AppRoutes() {
    const { isLoading } = useLoading();

    if (isLoading) {
        return <LoadingIndicator /> //If Loading State then Render Loading Indicator
    }

    
    return (
        //If Not Loading Render Routes
        <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/recommendation" element={<MusicPlayer />}/>
        </Routes>
    )
    };
  

export default AppRoutes;
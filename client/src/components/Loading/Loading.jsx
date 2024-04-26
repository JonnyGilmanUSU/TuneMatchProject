import React from 'react';
import { useLoading } from '../../util/LoadingContext';
import LoadingStyles from './loading.module.css';
import { MutatingDots } from 'react-loader-spinner';

const LoadingIndicator = () => {
    const { isLoading } = useLoading(); // Access the loading state

    if (!isLoading) return null; // Don't render anything if not loading

    return (
        <div className={LoadingStyles['loading-background']}>
            <div className={LoadingStyles['spinner-container']}>
                <MutatingDots color="#00000" height={80} width={80}/>
            </div>
        </div>
    ); 
};

export default LoadingIndicator;
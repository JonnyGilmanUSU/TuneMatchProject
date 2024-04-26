import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/Error/ErrorBoundary';
// Context Providers
import { TrackDataProvider } from './util/TrackDataContext';
import { LoadingProvider } from './util/LoadingContext';
// Pages
import AppRoutes from './routes/routes';



function App() {

  return (
    <BrowserRouter>
        <LoadingProvider>
          <TrackDataProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </TrackDataProvider>
        </LoadingProvider>
    </BrowserRouter>      
  )
}

export default App
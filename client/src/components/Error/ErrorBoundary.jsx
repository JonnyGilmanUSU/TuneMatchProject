import React, { Component } from 'react';
import LoadingStyles from '../Loading/loading.module.css';


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error: error, errorInfo: errorInfo });
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
            <div className={LoadingStyles['loading-background']}>
                <h1>Oh no! Something went wrong.</h1>
                <p>Error message</p>
            </div>
        );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


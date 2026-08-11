import '../src/index.css';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

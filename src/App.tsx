import React from 'react';
import { UserProfileProvider } from './components/UserProfileProvider';
import AuthWrapper from './components/AuthWrapper';
import './index.css';

function App() {
  return (
    <UserProfileProvider>
      <AuthWrapper />
    </UserProfileProvider>
  );
}

export default App;
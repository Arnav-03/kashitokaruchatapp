import React from 'react';
import axios from 'axios';
import { UsercontextProvider } from './UserContext'; // Import the context provider
import Routes from './Routes';

function App() {
  axios.defaults.baseURL = 'http://localhost:4000';
  axios.defaults.withCredentials = true;

  return (
    <UsercontextProvider>
      <Routes />
    </UsercontextProvider>
  );
}

export default App;

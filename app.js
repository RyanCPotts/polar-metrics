require('dotenv').config(); // Ensure .env is loaded
const apiKey = process.env.GOOGLE_API_KEY; // Ensure correct key from .env

import React from 'react';
import GoogleCivicDataAPI from './GoogleCivicDataAPI'; // Import the correct component

const App = () => {
  return (
    <div>
      <h1>Google Civic Information</h1>
      <GoogleCivicDataAPI address="1600 Amphitheatre Parkway, Mountain View, CA" apiKey={apiKey} /> {/* Pass apiKey prop */}
    </div>
  );
};

export default App;

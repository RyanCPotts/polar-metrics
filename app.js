// App.js
import React from 'react';
import GoogleCivicData from './GoogleCivicData';  // Correct import

const App = () => {
  return (
    <div>
      <h1>Google Civic Information</h1>
      <GoogleCivicData address="1600 Amphitheatre Parkway, Mountain View, CA" />  {/* Correct usage of component */}
    </div>
  );
};

export default App;

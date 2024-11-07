// App.js
import React from 'react';
import CivicData from './CivicData';
// import ProPublicaData from './ProPublicaData';

const App = () => {
  return (
    <div>
      <h1>Google Civic Information</h1>
      <CivicData address="1600 Amphitheatre Parkway, Mountain View, CA" />
    </div>
  );
};

export default App;

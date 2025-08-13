import React from 'react';
import GoogleCivicData from './GoogleCivicData';  // Correct import
import ProPublicaData from './ProPublicaDataAPI';  // Correct import to ProPublicaDataAPI.js

const App = () => {
  return (
    <div>
      <h1>Google Civic Information</h1>
      <GoogleCivicData address="1600 Amphitheatre Parkway, Mountain View, CA 94043" />  {/* Correct usage of component */}
      
      <h1>ProPublica Data</h1>
      <ProPublicaData />  {/* Correct usage without address prop */}
    </div>
  );
};

export default App;

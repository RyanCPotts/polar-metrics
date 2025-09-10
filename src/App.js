import React from 'react';
import GoogleCivicDataAPI from './Components/GoogleCivicDataAPI';  // Fixed import path
import OpenStatesData from './Components/OpenStatesData';    // Fixed import path

const App = () => {
  return (
    <div>
      <h1>Polar Metrics - Political Data Dashboard</h1>
      
      <section>
        <h2>Google Civic Information</h2>
        <GoogleCivicDataAPI />
      </section>
      
      <section>
        <h2>Open States</h2>
        <OpenStatesData />
      </section>
    </div>
  );
};

export default App;
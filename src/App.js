import React from 'react';
import GoogleCivicDataAPI from './Components/GoogleCivicDataAPI';  // Fixed import path
import ProPublicaDataAPI from './Components/ProPublicaDataAPI';    // Fixed import path

const App = () => {
  return (
    <div>
      <h1>Polar Metrics - Political Data Dashboard</h1>
      
      <section>
        <h2>Google Civic Information</h2>
        <GoogleCivicDataAPI address="1600 Amphitheatre Parkway, Mountain View, CA 94043" />
      </section>
      
      <section>
        <h2>ProPublica Congressional Data</h2>
        <ProPublicaDataAPI />
      </section>
    </div>
  );
};

export default App;
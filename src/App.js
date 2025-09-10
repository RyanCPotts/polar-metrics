import React, { useState } from 'react';
import GoogleCivicDataAPI from './Components/GoogleCivicDataAPI';
import OpenStatesData from './Components/OpenStatesData';
import CongressGovAPI from './Components/CongressGovAPI';
import './styles.css';

function App() {
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');

  return (
    <div className="app-container">
      <h1>🖥️ Polar Metrics</h1>

      <section className="input-section">
        <div>
          <label>Location (ZIP / City / Address): </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., 73120 or OKC, OK"
          />
        </div>

        <div>
          <label>State (for OpenStates API): </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            placeholder="e.g., OK"
          />
        </div>
      </section>

      <section className="api-section">
        <GoogleCivicDataAPI location={location} />
        <OpenStatesData state={state} />
        <CongressGovAPI />
      </section>
    </div>
  );
}

export default App;

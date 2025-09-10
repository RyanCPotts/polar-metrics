import React, { useEffect, useState } from 'react';
import getCivicData from './Components/GoogleCivicDataAPI';
import getOpenStatesData from './Components/OpenStatesData';
import getGovTrackBills from './Components/CongressGovAPI';
import extractStateFromAddress from './Components/LocalityService';
import './styles.css';

export default function App() {
  const [address, setAddress] = useState('1600 Pennsylvania Avenue NW, Washington DC');
  const [civicData, setCivicData] = useState(null);
  const [openStatesData, setOpenStatesData] = useState(null);
  const [govTrackData, setGovTrackData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const civic = await getCivicData(address);
      setCivicData(civic);

      const state = extractStateFromAddress(address);
      const openStates = await getOpenStatesData(state);
      setOpenStatesData(openStates);

      const govTrack = await getGovTrackBills();
      setGovTrackData(govTrack);
    }

    fetchData();
  }, [address]);

  return (
    <div className="App">
      <h1>PolarMetrics MVP</h1>
      <section>
        <h2>Address: {address}</h2>
        <h3>Google Civic Data:</h3>
        <pre>{civicData ? JSON.stringify(civicData, null, 2) : 'Loading...'}</pre>
      </section>
      <section>
        <h3>Open States Data:</h3>
        <pre>{openStatesData ? JSON.stringify(openStatesData, null, 2) : 'Loading...'}</pre>
      </section>
      <section>
        <h3>GovTrack Bills:</h3>
        <pre>{govTrackData ? JSON.stringify(govTrackData, null, 2) : 'Loading...'}</pre>
      </section>
    </div>
  );
}

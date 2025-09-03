import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CivicData = ({ address }) => {
  const [civicInfo, setCivicInfo] = useState(null);

  useEffect(() => {
    const getCivicData = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY;

      const endpoint = `https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=${address}&key=${apiKey}`;

      try {
        const response = await axios.get(endpoint);
        setCivicInfo(response.data);  // Store the data in state
      } catch (error) {
        console.error('Error fetching civic data:', error);
      }
    };

    getCivicData();
  }, [address]);  // Run this effect when the address changes

  if (!civicInfo) return <p>Loading...</p>;

  return (
    <div>
      <h3>Representatives:</h3>
      <ul>
        {civicInfo.officials.map((official) => (
          <li key={official.name}>{official.name} ({official.party})</li>
        ))}
      </ul>
    </div>
  );
};
export default CivicData; googleCivicDataAPI;

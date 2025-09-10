import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

function GoogleCivicDataAPI({ location }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(
    debounce(async (loc) => {
      if (!loc) return;
      try {
        const res = await axios.get(`/api/google-civic?location=${encodeURIComponent(loc)}`);
        setData(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching Google Civic data:', err);
        setError('Failed to fetch Google Civic data');
      }
    }, 500), // wait 500ms after typing stops
    []
  );

  useEffect(() => {
    fetchData(location);
  }, [location, fetchData]);

  if (!location) return null;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="api-box">
      <h2>Google Civic Representatives</h2>
      {data && data.officials ? (
        <ul>
          {data.officials.map((official, idx) => (
            <li key={idx}>
              {official.name} - {official.office || 'Unknown Office'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default GoogleCivicDataAPI;

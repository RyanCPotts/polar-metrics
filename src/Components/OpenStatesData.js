import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

function OpenStatesData({ state }) {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  const fetchBills = useCallback(
    debounce(async (st) => {
      if (!st) return;
      try {
        const res = await axios.get(`/api/openstates?state=${st}`);
        setBills(res.data.results || []);
        setError('');
      } catch (err) {
        console.error('Error fetching Open States data:', err);
        setError('Failed to fetch Open States data');
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchBills(state);
  }, [state, fetchBills]);

  if (!state) return null;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="api-box">
      <h2>Open States Bills</h2>
      {bills.length ? (
        <ul>
          {bills.map((bill) => (
            <li key={bill.id}>{bill.title}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default OpenStatesData;

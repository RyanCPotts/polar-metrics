import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CongressGovAPI() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get('/api/govtrack/bills');
        setBills(res.data.objects || []);
        setError('');
      } catch (err) {
        console.error('Error fetching GovTrack data:', err);
        setError('Failed to fetch GovTrack data');
      }
    };

    fetchBills();
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="api-box">
      <h2>GovTrack Bills</h2>
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

export default CongressGovAPI;

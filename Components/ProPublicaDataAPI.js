// ProPublicaData.js- --- NEED API KEY
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProPublicaData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProPublicaData = async () => {
      try {
        const response = await axios.get('https://api.propublica.org/congress/v1/116/senate/members.json', {
          headers: {
            'X-API-Key': process.env.PROPUBLICA_API_KEY,
          }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchProPublicaData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Senate Members Data from ProPublica</h1>
      <ul>
        {data.results[0].members.map((member) => (
          <li key={member.id}>
            {member.first_name} {member.last_name} - {member.party}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProPublicaData;

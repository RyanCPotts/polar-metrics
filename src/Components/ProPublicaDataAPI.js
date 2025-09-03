// ProPublicaDataAPI.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProPublicaDataAPI = () => {
  const [senateData, setSenateData] = useState(null);
  const [houseData, setHouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProPublicaData = async () => {
      try {
        const apiKey = process.env.REACT_APP_PROPUBLICA_API_KEY;
        
        if (!apiKey) {
          throw new Error('ProPublica API key not found. Make sure REACT_APP_PROPUBLICA_API_KEY is set in your .env file');
        }

        // Fetch Senate members (118th Congress)
        const senateResponse = await axios.get('https://api.propublica.org/congress/v1/118/senate/members.json', {
          headers: {
            'X-API-Key': apiKey,
          }
        });

        // Fetch House members (118th Congress)
        const houseResponse = await axios.get('https://api.propublica.org/congress/v1/118/house/members.json', {
          headers: {
            'X-API-Key': apiKey,
          }
        });

        setSenateData(senateResponse.data);
        setHouseData(houseResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ProPublica data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProPublicaData();
  }, []);

  if (loading) {
    return <div>Loading ProPublica congressional data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3>Senate Members ({senateData?.results[0]?.members?.length || 0})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {senateData?.results[0]?.members?.map((member) => (
            <div key={member.id} style={{ marginBottom: '5px' }}>
              <strong>{member.first_name} {member.last_name}</strong> ({member.party}-{member.state})
              {member.leadership_role && <em> - {member.leadership_role}</em>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>House Members ({houseData?.results[0]?.members?.length || 0})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {houseData?.results[0]?.members?.slice(0, 20).map((member) => (
            <div key={member.id} style={{ marginBottom: '5px' }}>
              <strong>{member.first_name} {member.last_name}</strong> ({member.party}-{member.state}-{member.district})
            </div>
          ))}
          {houseData?.results[0]?.members?.length > 20 && 
            <div style={{ fontStyle: 'italic', marginTop: '10px' }}>
              ...and {houseData.results[0].members.length - 20} more House members
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ProPublicaDataAPI;
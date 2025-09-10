import axios from 'axios';

export default async function getCivicData(address) {
  try {
    const response = await axios.get(`/api/google-civic/${encodeURIComponent(address)}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Google Civic data:', err);
    return null;
  }
}

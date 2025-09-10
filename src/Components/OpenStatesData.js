import axios from 'axios';

export default async function getOpenStatesData(state) {
  try {
    const response = await axios.get(`/api/openstates/${state}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Open States data:', err);
    return null;
  }
}

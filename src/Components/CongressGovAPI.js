import axios from 'axios';

export default async function getGovTrackBills() {
  try {
    const response = await axios.get(`/api/govtrack/bills`);
    return response.data;
  } catch (err) {
    console.error('Error fetching GovTrack bills:', err);
    return null;
  }
}

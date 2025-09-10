// Server.js
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --------------------------
// API Endpoints
// --------------------------

// 1. Google Civic Information API
const GOOGLE_CIVIC_API_KEY = process.env.GOOGLE_CIVIC_API_KEY;

app.get('/api/google-civic', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'No location provided' });
    }

    const response = await axios.get(
      'https://www.googleapis.com/civicinfo/v2/representatives',
      {
        params: {
          key: GOOGLE_CIVIC_API_KEY,
          address: location
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      'Google Civic API error:',
      error.response ? error.response.data : error.message
    );
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: 'Failed to fetch civic data' });
  }
});

// 2. Open States API
const OPEN_STATES_API_KEY = process.env.OPEN_STATES_API_KEY;

app.get('/api/openstates', async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ error: 'No state provided' });
    }

    const response = await axios.get('https://v3.openstates.org/bills', {
      params: {
        apikey: OPEN_STATES_API_KEY,
        jurisdiction: state,
        per_page: 5,
        sort: 'updated_desc',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      'Open States API error:',
      error.response ? error.response.data : error.message
    );
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: 'Failed to fetch Open States data' });
  }
});

// 3. GovTrack API
app.get('/api/govtrack/bills', async (req, res) => {
  try {
    const response = await axios.get('https://www.govtrack.us/api/v2/bill', {
      params: {
        limit: 5,
        order_by: '-current_status_date',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      'GovTrack API error:',
      error.response ? error.response.data : error.message
    );
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: 'Failed to fetch GovTrack data' });
  }
});

// --------------------------
// Serve React App (Production)
// --------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// --------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        apis: {
            propublica: !!process.env.PROPUBLICA_API_KEY,
            googleCivic: !!process.env.GOOGLE_CIVIC_API_KEY
        }
    });
});

app.listen(PORT, () => {
    console.log(`íº€ PolarMetrics running on http://localhost:${PORT}`);
    console.log(`í³Š Health check: http://localhost:${PORT}/health`);
});

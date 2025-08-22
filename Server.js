/**
 * PolarMetrics Express Server
 * Backend API server for political data tracking application
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    }
});
app.use('/api/', limiter);

// Mock API classes for immediate development (replace with real APIs later)
class MockAPI {
    static async getMockData(location) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            representatives: [
                { name: "Sen. John Hickenlooper", party: "D", office: "U.S. Senate", state: "CO" },
                { name: "Sen. Michael Bennet", party: "D", office: "U.S. Senate", state: "CO" },
                { name: "Rep. Joe Neguse", party: "D", office: "U.S. House", district: "CO-02" }
            ],
            bills: [
                { title: "Infrastructure Investment Act", status: "Passed", date: "2025-08-15" },
                { title: "Climate Action Bill", status: "In Committee", date: "2025-08-10" },
                { title: "Healthcare Reform Act", status: "Floor Vote", date: "2025-08-18" }
            ],
            elections: [
                { name: "General Election 2026", date: "2026-11-03", type: "General" },
                { name: "Primary Election 2026", date: "2026-06-02", type: "Primary" }
            ]
        };
    }
}

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        apis: {
            congress: !!process.env.CONGRESS_API_KEY,
            propublica: !!process.env.PROPUBLICA_API_KEY,
            googleCivic: !!process.env.GOOGLE_CIVIC_API_KEY
        }
    });
});

// Main API Routes

/**
 * Analyze location endpoint
 * GET /api/analyze/:address
 */
app.get('/api/analyze/:address', async (req, res) => {
    try {
        const address = decodeURIComponent(req.params.address);
        
        if (!address || address.length < 3) {
            return res.status(400).json({
                error: 'Invalid address provided',
                message: 'Address must be at least 3 characters long'
            });
        }

        console.log(`📍 Analyzing location: ${address}`);
        
        // For now, use mock data - replace with real API calls when you have keys
        const analysis = await MockAPI.getMockData(address);
        
        res.json({
            success: true,
            data: {
                address: address,
                timestamp: new Date().toISOString(),
                representatives: analysis.representatives,
                legislation: analysis.bills,
                elections: analysis.elections,
                summary: {
                    totalRepresentatives: analysis.representatives.length,
                    recentBills: analysis.bills.length,
                    upcomingElections: analysis.elections.length
                }
            },
            requestId: generateRequestId()
        });

    } catch (error) {
        console.error('Location analysis error:', error);
        res.status(500).json({
            error: 'Location analysis failed',
            message: error.message,
            requestId: generateRequestId()
        });
    }
});

/**
 * Get representatives for address
 * GET /api/representatives/:address
 */
app.get('/api/representatives/:address', async (req, res) => {
    try {
        const address = decodeURIComponent(req.params.address);
        const data = await MockAPI.getMockData(address);
        
        res.json({
            success: true,
            data: {
                address: address,
                representatives: data.representatives
            },
            requestId: generateRequestId()
        });

    } catch (error) {
        console.error('Representatives lookup error:', error);
        res.status(500).json({
            error: 'Representatives lookup failed',
            message: error.message,
            requestId: generateRequestId()
        });
    }
});

/**
 * Get recent bills
 * GET /api/bills
 */
app.get('/api/bills', async (req, res) => {
    try {
        const data = await MockAPI.getMockData('');
        
        res.json({
            success: true,
            data: {
                bills: data.bills,
                total: data.bills.length
            },
            requestId: generateRequestId()
        });

    } catch (error) {
        console.error('Bills lookup error:', error);
        res.status(500).json({
            error: 'Bills lookup failed',
            message: error.message,
            requestId: generateRequestId()
        });
    }
});

/**
 * Get elections
 * GET /api/elections
 */
app.get('/api/elections', async (req, res) => {
    try {
        const data = await MockAPI.getMockData('');
        
        const upcoming = data.elections.filter(e => new Date(e.date) > new Date());
        const recent = data.elections.filter(e => new Date(e.date) <= new Date());
        
        res.json({
            success: true,
            data: {
                upcoming: upcoming,
                recent: recent,
                total: data.elections.length
            },
            requestId: generateRequestId()
        });

    } catch (error) {
        console.error('Elections lookup error:', error);
        res.status(500).json({
            error: 'Elections lookup failed',
            message: error.message,
            requestId: generateRequestId()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        requestId: generateRequestId()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /api/analyze/:address',
            'GET /api/representatives/:address',
            'GET /api/bills',
            'GET /api/elections'
        ]
    });
});

// Utility functions
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PolarMetrics API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Frontend: http://localhost:${PORT}`);
    
    // Log API key status
    console.log('\n🔑 API Key Status:');
    console.log(`   ProPublica: ${process.env.PROPUBLICA_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Google Civic: ${process.env.GOOGLE_CIVIC_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log('\n💡 Tip: Add API keys to .env file for real data');
    console.log('📁 Using mock data until API keys are configured\n');
});

module.exports = app;
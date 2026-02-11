const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const creditRoutes = require('./routes/creditRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const setupEventListeners = require('./services/eventListener');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/credits', creditRoutes);
app.use('/api/auctions', auctionRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Carbon Credit Exchange Backend is running...');
});

// Start Blockchain Event Listener
// Note: This might throw if RPC is not available, handle gracefully or let it fail?
// For dev, we'll try-catch it to allow server to run even if blockchain is off.
try {
    setupEventListeners();
} catch (error) {
    console.error('Failed to start blockchain listeners:', error.message);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

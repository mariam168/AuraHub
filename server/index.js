require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());

// --- Define Routes ---
// This is the most important part to check
// It tells Express: "When a request comes to /api/auth, use the rules in authRoutes.js"
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
// Add other routes if you have them, e.g., shareRoutes
// app.use('/api/share', require('./routes/shareRoutes'));

// Serve static files (like uploaded images/videos) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Simple check to see if the server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
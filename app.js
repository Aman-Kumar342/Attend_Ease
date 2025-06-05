require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDb = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to database
connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Use routes
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('AttendEase Backend API is running');
});

//Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
     message: 'Server is healthy' ,
     Timestamp:new Date().toISOString()
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
// Export the app for testing
module.exports = app;
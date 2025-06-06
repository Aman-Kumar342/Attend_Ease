const jwt = require('jsonwebtoken');

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, // ✅ Use 'userId' consistently
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Export the functions
module.exports = {
    generateToken,
    verifyToken
};

const mongoose = require('mongoose');
const connectDb=async () => {
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(error){
        console.error(`Database connection Error: ${error.message}`);
        process.exit(1);
    }
};
module.exports = connectDb;
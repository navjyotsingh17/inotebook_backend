const mongoose = require('mongoose');
require('dotenv').config(); // to load all the .env variables

const mongoURI = process.env.DB_URL;
console.log(mongoURI);

const connectToMongo = async () => { 
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};

module.exports = connectToMongo;

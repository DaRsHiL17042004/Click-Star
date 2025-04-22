// backend/server.js
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

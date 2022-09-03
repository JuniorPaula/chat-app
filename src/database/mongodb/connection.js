require('dotenv/config');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, () => {
  console.info('Connected to mongodb');
});

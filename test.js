require('dotenv').config();
const mongoose = require('mongoose');
console.log('URL:', process.env.ATLASDB_URL);
mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log('connected!'))
  .catch(err => console.log(err));

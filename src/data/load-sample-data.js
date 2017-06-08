// Import Dependencies
require('dotenv').config({ path: __dirname + '/../../variables.env' });
const fs = require('fs')

// Connect to Database and Use Promises
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise

// Import Models
const Store  = require('../models/Store')
const User   = require('../models/User')
const Review = require('../models/Review')

// Parse JSON (containing Data)
const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json', 'utf-8'));

// Nuke the Data
async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await Store.remove();
  await Review.remove();
  await User.remove();
  console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
  process.exit();
}

// Add the Data
async function loadData() {
  try {
    await Store.insertMany(stores);
    await Review.insertMany(reviews);
    await User.insertMany(users);
    console.log('👍👍👍👍👍👍👍👍 Done!');
    process.exit();
  } catch(e) {
    console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    process.exit();
  }
}

// Run the commands
if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}

// Babel Polyfill
require('babel-polyfill')

// Import Dependencies
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import reload from 'reload'
dotenv.config({ path: 'variables.env' })

// Connect to Database and Handle Errors
mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise
mongoose.connection.on('error', (err) => {
  console.error(`🙅 → ${err.message}`)
})

// Import Models
require('./models/Store')
require('./models/User')
require('./models/Review')

// Set Port and Start Server!
const port   = process.env.PORT || 3000
const app    = require('./app')
const server = app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})

reload(server, app)

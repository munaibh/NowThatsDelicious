// Dependency Imports
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import connect from 'connect-mongo'
import path from 'path'
import bodyParser from 'body-parser'
import passport from 'passport'
import promisify from 'es6-promisify'
import flash from 'connect-flash'
import expressValidator from 'express-validator'
 
// Local Imports
import helpers from './helpers'
import errorHandler from './handlers/error'
require('./handlers/passport')

// Setup Variables
const app = express()
const MongoStore = connect(session)

// Configure Views
app.locals.basedir = path.join(__dirname, 'views')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

// Configure Form, Validation and Flash
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressValidator())
app.use(flash())

// Configure Session
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Configure Passport JS
app.use(passport.initialize())
app.use(passport.session())

// Pass Variable to Templates
app.use((req, res, next) => {
  res.locals.h = helpers
  res.locals.flashes = req.flash()
  res.locals.user = req.user || null
  res.locals.currentPath = req.path
  next()
})

// Promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req)
  next()
})

// Configure Routes and Errors
app.use('/', require('./routes/'))
app.use(errorHandler.notFound)
app.use(errorHandler.flashErrors)

// Development Errors
if (app.get('env') === 'development') {
  app.use(errorHandler.developmentErrors)
}

// Production Errors
app.use(errorHandler.productionErrors)

// Export the App
module.exports = app

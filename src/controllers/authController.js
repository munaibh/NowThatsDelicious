import passport from 'passport'
import mongoose from 'mongoose'
import crypto from 'crypto'
import promisify from 'es6-promisify'
const User = mongoose.model('User')
const mail = require('../handlers/mail')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed to Login',
  successRedirect: '/',
  successFlash: 'You have been logged in!'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out!')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) return next();
  req.flash("error", 'Oops! You must be logged in!')
  res.redirect('/login')
}

exports.forgot = async (req, res) => {
  // Check if user exists
  const user = await User.findOne({email: req.body.email})
  if(!user) {
    req.flash('error', 'User does not exist.')
    return res.redirect('/login')
  }
  // Set and save tokens.
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  user.resetPasswordExpires = Date.now() + 36000000
  await user.save()
  // Send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  req.flash('success', `You've been emailed a password reset link.`)

  await mail.send({
    user: user,
    subject: 'Password Reset',
    resetURL: resetURL,
    filename: 'password-reset'
  })

  res.redirect('/login')
}

exports.reset = async (req, res) => {
  // Check if user exists with token
  // check if token is not expired
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })

  if(!user) {
    req.flash('error', 'Password reset token invalid or has expired')
    return res.redirect('/login')
  }

  res.render('reset', { title: 'Reset Password'})
}

exports.confirmPasswords = (req, res, next) => {

  req.checkBody('password', "Password cannot be blank!").notEmpty()
  req.checkBody('confirm-password', "Confirmed Password cannot be blank!").notEmpty()
  req.checkBody('confirm-password', "Ouch! The passwords don't match").equals(req.body.password)

  const errors = req.validationErrors()
  if(errors) {
    req.flash('error', errors.map(err => err.msg))
    res.render('reset', { title: 'Reset Password', flashes: req.flash()})
    return
  }
  next()
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })

  if(!user) {
    req.flash('error', 'Password reset token invalid or has expired')
    return res.redirect('/login')
  }

  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  const updatedUser = await user.save()
  await req.login(updatedUser)
  req.flash('success', "Woo! Your password has been reset and you've been logged in!")
  res.redirect('/')
}

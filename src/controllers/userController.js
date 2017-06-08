import mongoose from 'mongoose'
import promisify from 'es6-promisify'
const User = mongoose.model('User')

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' })
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' })
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name')
  req.checkBody('name',  "You must enter a name!").notEmpty()
  req.checkBody('email', "You must enter a valid email!").isEmail()
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  })
  req.checkBody('password', "Password cannot be blank!").notEmpty()
  req.checkBody('confirm-password', "Confirmed Password cannot be blank!").notEmpty()
  req.checkBody('confirm-password', "Ouch! The passwords don't match").equals(req.body.password)

  const errors = req.validationErrors()
  if(errors) {
    req.flash('error', errors.map(err => err.msg))
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })
    return
  }
  next()
}

exports.register = async (req, res, next) => {
  const user = await new User({name: req.body.name, email: req.body.email})
  // User.register(user, req.body.password, function(err, user))
  const register = promisify(User.register, User)
  await register(user, req.body.password)
  next()
}


exports.account = (req, res) => {
  res.render('account', { title: "Edit Account"})
}

exports.updateAccount = async (req, res) => {

  const { name, email } = req.body
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set : { name, email }},
    { new: true, runValidators: true, context: 'query'}
  )
  req.flash('success', "Your details have been updated!")
  res.redirect('back')
}

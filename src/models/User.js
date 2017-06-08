import mongoose from 'mongoose'
const { Schema } = mongoose
mongoose.Promise = global.Promise

import md5 from 'md5'
import validator from 'validator'
import mongodbErrorHandler from 'mongoose-mongodb-errors'
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: "Please enter an email!",
  },
  name: {
    type: String,
    required: "Please enter a name.",
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [{ type: Schema.ObjectId, ref: 'Store' }]
})

userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email)
  return `https://gravatar.com/avatar/${hash}?s=200`
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email'})
userSchema.plugin(mongodbErrorHandler)

const User = mongoose.model('User', userSchema)
module.exports = User

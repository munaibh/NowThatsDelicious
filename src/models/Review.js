import mongoose from 'mongoose'
const { Schema } = mongoose
mongoose.Promise = global.Promise

const reviewSchema = new Schema({
  store:  { type: Schema.ObjectId, ref: 'Store', required: "You must supply an store!"},
  author: { type: Schema.ObjectId, ref: 'User', required: "You must supply an author!"},
  text: { type: String, required: "Please enter a message!"},
  created: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5, required: "Please enter a rating!"}
})

function autoPopulate(next) {
  this.populate({
    path: 'author',
    select: '-_id'
  })
  next()
}

reviewSchema.pre('find', autoPopulate)
reviewSchema.pre('findOne', autoPopulate)

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review

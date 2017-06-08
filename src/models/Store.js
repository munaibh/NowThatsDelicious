import mongoose from 'mongoose'
import slug from 'slugs'
import User from './User'
const { Schema } = mongoose
mongoose.Promise = global.Promise
import promisify from 'es6-promisify'

const storeSchema = new Schema({
  name: { type: String, trim: true, required: 'Please enter a store name!'},
  slug: String,
  description: { type: String, trim: true },
  photo: String,
  tags: [String],
  created: { type: Date, default: Date.now },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [{
      type: Number,
      required: 'You must enter coordinates!'
    }],
    address: {
      type: String,
      required: 'Must supply an address!'
    }
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: "You must supply an author!"
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})


storeSchema.index({
  name: 'text',
  description: 'text'
})

storeSchema.index({
  location: '2dsphere'
})

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) { return next() }
  this.slug = slug(this.name)

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await this.constructor.find({slug: slugRegEx})

  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }
  next()
})

storeSchema.pre('findOneAndUpdate', async function(next) {

  // Find and compare original details to new ones.
  const store = await this.findOne({})
  if(!this._update.name || store.name === this._update.name) {
    return next()
  }

  // See if any stores with slug already exist.
  let   storeSlug = slug(this._update.name)
  const slugRegEx = new RegExp(`^(${storeSlug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await Store.find({slug: slugRegEx})

  // Set slug with incremement if store exists.
  if(storesWithSlug.length) storeSlug = `${storeSlug}-${storesWithSlug.length + 1}`

  // Update store with new slug.
  const newSlug = promisify(this.update({}, { slug: storeSlug }), this)
  await newSlug
  next()

})

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort : { count: -1 }}
  ])
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews'
      }
    },
    {
      $match: {
        'reviews.1': {
          $exists: true
        }
      }
    },
    {
      $project: {
        name: '$$ROOT.name',
        photo: '$$ROOT.photo',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating'}
      }
    },
    { $sort: { averageRating: -1 }},
    { $limit: 10 }
  ])
}

storeSchema.virtual('likes', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hearts'
})

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
})

function autoPopulate(next) {
  this.populate({
    path: 'author reviews likes',
  })
  next()
}

storeSchema.pre('find', autoPopulate)
storeSchema.pre('findOne', autoPopulate)


const Store = mongoose.model('Store', storeSchema)
module.exports = Store

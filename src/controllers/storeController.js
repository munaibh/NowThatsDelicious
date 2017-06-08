import mongoose from 'mongoose'
import multer from 'multer'
import jimp from 'jimp'
import uuid from 'uuid'
const Store = mongoose.model('Store')
const User = mongoose.model('User')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if(isPhoto) {
      next(null, true)
    } else {
      next({message: "That filetype isnt allowed!"}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index', {
    title: "Welcome"
  })
}

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  })
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  if(!req.file) return next()
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`

  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./src/public/uploads/${req.body.photo}`);

  next()
}

exports.createStore = async (req, res) => {
  req.sanitizeBody('name')
  req.body.author = req.user._id
  const store = await new Store(req.body).save()
  req.flash('success', `You just created ${store.name}`)
  res.redirect(`/store/${store.slug}`)
}


const getPaginated = async (query, passedPage = 1) => {
  const page = passedPage || 1
  const limit = 5
  const skip  = limit*(page - 1)
  const queryPromise = query.limit(limit).skip(skip).sort({created: 'desc'})
  const countPromise = Store.find({}).count()
  const [stores, count] = await Promise.all([queryPromise, countPromise])
  const pages  = Math.ceil(count/limit)
  return { stores, count, pages}
}


exports.getStores = async (req, res) => {

  // const paginated = await getPaginated(Store.find({}), req.params.id)
  const page  = req.params.page || 1
  const limit = 9
  const skip  = limit*(page - 1)

  if(req.params.page < 0) {
    req.flash('info', `You asked for page ${req.params.page}. but that does't exist so we put you on the first one`)
    return res.redirect(`/stores/page/1`)
  }

  const storesPromise =  Store.find().limit(limit).skip(skip).sort({created: 'desc'})
  const countPromise  =  Store.count()

  const [stores, count] = await Promise.all([storesPromise, countPromise])
  const pages  = Math.ceil(count/limit)

  if(req.params.page && !stores.length) {
    req.flash('info', `You asked for page ${page}, but that doesn\'t exist, so we put you on the last one`)
    return res.redirect(`/stores/page/${pages}`)
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count })
}








const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)) {
    throw Error('You must own a store to edit it!')
  }
}


exports.editStore = async (req, res) => {
  const store = await Store.findById(req.params.id)
  confirmOwner(store, req.user)
  res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {

  req.body.location.type = "Point"
  if(!req.body.tags) req.body.tags = []

  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return new store after update
    runValidators: true
  }).exec()

  req.flash('success', `Sucessfully updated ${store.name}. <a href="/store/${store.slug}">Visit Store</a>`)
  res.redirect(`/stores/${store._id}/edit`)
}


exports.getStore = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug})
  if(!store) return next()
  res.render('store', {title: store.name, store})
}

exports.getStoresByTag = async (req, res) => {
  const tag  = req.params.tag
  const tagQuery = tag || { $exists: true }
  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({ tags: tagQuery })

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])

  res.render('tags', {title: 'Tags', tags, stores, tag})
}

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    { $text: { $search: req.params.query } },
    { score: { $meta: 'textScore' }}
  )
  .sort(
    { score: { $meta: 'textScore' }}
  )

  res.json(stores)
}

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
  const query = {
    location: { $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: 10000
    }}
  }

  const stores = await Store.find(query).select('slug name description location photo').limit(10)
  res.json(stores)
}


exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' })
}


exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString())
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'
  const userPromise = User.findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  )

  const likePromise = Store.findById(req.params.id).populate('likes').select('likes')

  const [user, likes] = await Promise.all([userPromise, likePromise])
  // console.log(likePromise.likes.length)
  res.json({user, likes: likes.likes.length})
}


exports.heartedStores = async (req, res) => {
  console.log(req.user)
  const stores = await Store.find({_id: {
    $in: req.user.hearts
  }}).populate('likes')

  res.render('stores', { title: "Hearted", stores })
}


exports.getTopStores = async (req,res) => {
  const stores = await Store.getTopStores()
  res.render('topStores', { title: "Top Stores", stores})
}

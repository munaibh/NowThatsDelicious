import express from 'express'
import storeController from '../controllers/storeController'
import userController  from '../controllers/userController'
import authController  from '../controllers/authController'
import reviewController  from '../controllers/reviewController'
const router = express.Router()
const { catchErrors } = require('../handlers/error')

router.get('/', catchErrors(storeController.getStores))
router.get('/stores', catchErrors(storeController.getStores))
router.get('/stores/page/:page', catchErrors(storeController.getStores))
router.get('/add', authController.isLoggedIn, storeController.addStore)
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
)
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
)
router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.get('/store/:slug', catchErrors(storeController.getStore))

router.get('/tags', catchErrors(storeController.getStoresByTag))
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag))

router.get('/login', userController.loginForm)
router.get('/register', userController.registerForm)


router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
)

router.post('/login', authController.login)
router.get('/logout', authController.logout)


router.get('/account', authController.isLoggedIn, userController.account)
router.post('/account', authController.isLoggedIn, catchErrors(userController.updateAccount))

router.post('/account/forgot', catchErrors(authController.forgot))

router.get('/account/reset/:token', catchErrors(authController.reset))
router.post('/account/reset/:token', authController.confirmPasswords, catchErrors(authController.update))


router.get('/api/search/:query', catchErrors(storeController.searchStores))
router.get('/api/stores/near', catchErrors(storeController.mapStores))

router.get('/map', storeController.mapPage)

router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore))


router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.heartedStores))


router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.submitReview))
router.get('/top', catchErrors(storeController.getTopStores))


module.exports = router

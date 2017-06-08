// Catch Error Handler
exports.catchErrors = (fn) => {
  return(req, res, next) => {
    return fn(req, res, next).catch(next)
  }
}

// 404 (Not Found) Handler
exports.notFound = (req, res, next) => {

  if(process.env.NODE_ENV === "development" && req.path.startsWith('/reload/reload.js')) {
    return next()
  }
  const err = new Error('Not Found')
  err.status = 404
  next(err)
}

// MongoDB Validation Error Handler (Flash)
exports.flashErrors = (err, req, res, next) => {
  if (!err.errors) return next(err)
  const errorKeys = Object.keys(err.errors)
  errorKeys.forEach(key => req.flash('error', err.errors[key].message))
  res.redirect('back')
}

// Development Error Handler
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || ''
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  }
  res.status(err.status || 500)
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails)
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  })
}

// Production Error Handler (No Leak)
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
}

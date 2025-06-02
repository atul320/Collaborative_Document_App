const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.expose === true) {
    res.status(err.status || 500).json({
      error: {
        status: err.status || 500,
        message: err.message
      }
    });
  } else {
    res.status(500).json({
      error: {
        status: 500,
        message: 'Internal Server Error'
      }
    });
  }
};

const notFound = (req, res, next) => {
  next(createError.NotFound('Route not found'));
};

module.exports = { errorHandler, notFound };
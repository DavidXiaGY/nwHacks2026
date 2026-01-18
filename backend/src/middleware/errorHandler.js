export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation',
      details: 'A record with this value already exists'
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      details: err.meta?.cause || 'The requested resource does not exist'
    })
  }

  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database error',
      details: err.message
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    })
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors || err.message
    })
  }

  // Default error
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack })
  })
}

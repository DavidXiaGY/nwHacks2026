import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import childrenRoutes from './routes/children.js'
import orphanagesRoutes from './routes/orphanages.js'
import wishlistRoutes from './routes/wishlist.js'
import donationsRoutes from './routes/donations.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/children', childrenRoutes)
app.use('/api/orphanages', orphanagesRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/donations', donationsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    message: 'Internal server error',
    error: err.message || 'Unknown error'
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

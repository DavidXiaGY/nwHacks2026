import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/auth.js'
import orphanageRoutes from './routes/orphanages.js'
import childrenRoutes from './routes/children.js'
import wishlistRoutes from './routes/wishlist.js'
import donationRoutes from './routes/donations.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/orphanages', orphanageRoutes)
app.use('/api/children', childrenRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/donations', donationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

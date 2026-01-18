import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Sign-up route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body

    // Validation
    if (!email || !password || !displayName || !role) {
      return res.status(400).json({ 
        message: 'All fields are required: email, password, displayName, role' 
      })
    }

    // Validate role
    if (!['DONATOR', 'ORGANIZER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be DONATOR, ORGANIZER, or ADMIN' 
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        role
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    })
  } catch (error) {
    console.error('Sign-up error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
})

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt
    }

    res.json({
      message: 'Login successful',
      token,
      user: userData
    })
  } catch (error) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
})

export default router

import express from 'express'
import { body, validationResult, query } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { calculateDistance } from '../utils/location.js'

const router = express.Router()

// Get all orphanages (sorted by distance if lat/lng provided)
router.get(
  '/',
  [
    query('lat').optional().isFloat(),
    query('lng').optional().isFloat()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { lat, lng } = req.query

      const orphanages = await prisma.orphanage.findMany({
        include: {
          organizer: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          },
          children: {
            include: {
              wishlist: true
            }
          }
        }
      })

      // Sort by distance if coordinates provided
      if (lat && lng) {
        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        orphanages.forEach(orphanage => {
          orphanage.distance = calculateDistance(
            userLat,
            userLng,
            orphanage.latitude,
            orphanage.longitude
          )
        })

        orphanages.sort((a, b) => a.distance - b.distance)
      }

      res.json(orphanages)
    } catch (error) {
      next(error)
    }
  }
)

// Get single orphanage by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const orphanage = await prisma.orphanage.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        children: {
          include: {
            wishlist: {
              include: {
                heldBy: {
                  select: {
                    id: true,
                    displayName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!orphanage) {
      return res.status(404).json({ error: 'Orphanage not found' })
    }

    res.json(orphanage)
  } catch (error) {
    next(error)
  }
})

// Create orphanage (organizer only)
router.post(
  '/',
  authenticate,
  requireRole('ORGANIZER'),
  [
    body('name').trim().isLength({ min: 1 }),
    body('description').optional().trim(),
    body('website').optional().isURL(),
    body('contactEmail').optional().isEmail(),
    body('latitude').isFloat(),
    body('longitude').isFloat()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { name, description, website, contactEmail, latitude, longitude } = req.body

      // Check if organizer already has an orphanage
      const existingOrphanage = await prisma.orphanage.findUnique({
        where: { organizerId: req.userId }
      })

      if (existingOrphanage) {
        return res.status(409).json({ error: 'You already have an orphanage registered' })
      }

      const orphanage = await prisma.orphanage.create({
        data: {
          name,
          description,
          website,
          contactEmail,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          organizerId: req.userId
        },
        include: {
          organizer: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      })

      res.status(201).json(orphanage)
    } catch (error) {
      next(error)
    }
  }
)

export default router

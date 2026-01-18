import express from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get children for an orphanage
router.get('/orphanage/:orphanageId', async (req, res, next) => {
  try {
    const { orphanageId } = req.params

    // Verify orphanage exists
    const orphanage = await prisma.orphanage.findUnique({
      where: { id: orphanageId }
    })

    if (!orphanage) {
      return res.status(404).json({ error: 'Orphanage not found' })
    }

    const children = await prisma.child.findMany({
      where: { orphanageId },
      include: {
        wishlist: {
          include: {
            heldBy: {
              select: {
                id: true,
                displayName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(children)
  } catch (error) {
    next(error)
  }
})

// Create child with wishlist (organizer only)
router.post(
  '/',
  authenticate,
  requireRole('ORGANIZER'),
  [
    body('firstName').trim().isLength({ min: 1 }),
    body('age').optional().isInt({ min: 0, max: 120 }),
    body('orphanageId').notEmpty(),
    body('wishlistItems').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { firstName, age, orphanageId, wishlistItems = [] } = req.body

      // Verify orphanage exists and belongs to this organizer
      const orphanage = await prisma.orphanage.findUnique({
        where: { id: orphanageId }
      })

      if (!orphanage) {
        return res.status(404).json({ error: 'Orphanage not found' })
      }

      if (orphanage.organizerId !== req.userId) {
        return res.status(403).json({ error: 'You can only add children to your own orphanage' })
      }

      // Validate wishlist items
      for (const item of wishlistItems) {
        if (!item.name || !item.externalLink) {
          return res.status(400).json({
            error: 'Wishlist items must have name and externalLink'
          })
        }
      }

      // Create child with wishlist items
      const child = await prisma.child.create({
        data: {
          firstName,
          age: age ? parseInt(age) : null,
          orphanageId,
          wishlist: {
            create: wishlistItems.map(item => ({
              name: item.name,
              description: item.description || null,
              externalLink: item.externalLink,
              price: item.price ? parseFloat(item.price) : null,
              status: 'AVAILABLE'
            }))
          }
        },
        include: {
          wishlist: true
        }
      })

      res.status(201).json(child)
    } catch (error) {
      next(error)
    }
  }
)

export default router

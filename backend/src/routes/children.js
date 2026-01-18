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

// Get a single child by ID
router.get('/:childId', async (req, res, next) => {
  try {
    const { childId } = req.params

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        orphanage: {
          select: {
            id: true,
            name: true,
            organizerId: true
          }
        },
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
      }
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    res.json(child)
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
    body('gender').optional().trim(),
    body('orphanageId').notEmpty(),
    body('clothingShirtSize').optional().trim(),
    body('clothingPantSize').optional().trim(),
    body('clothingShoeSize').optional().trim(),
    body('clothingToyPreference').optional().trim(),
    body('interests').optional().trim(),
    body('notes').optional().trim(),
    body('wishlistItems').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const {
        firstName,
        age,
        gender,
        orphanageId,
        clothingShirtSize,
        clothingPantSize,
        clothingShoeSize,
        clothingToyPreference,
        interests,
        notes,
        wishlistItems = []
      } = req.body

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
          gender: gender || null,
          clothingShirtSize: clothingShirtSize || null,
          clothingPantSize: clothingPantSize || null,
          clothingShoeSize: clothingShoeSize || null,
          clothingToyPreference: clothingToyPreference || null,
          interests: interests || null,
          notes: notes || null,
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
          wishlist: true,
          orphanage: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      res.status(201).json(child)
    } catch (error) {
      next(error)
    }
  }
)

// Update child (organizer only)
router.put(
  '/:childId',
  authenticate,
  requireRole('ORGANIZER'),
  [
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('age').optional().isInt({ min: 0, max: 120 }),
    body('gender').optional().trim(),
    body('clothingShirtSize').optional().trim(),
    body('clothingPantSize').optional().trim(),
    body('clothingShoeSize').optional().trim(),
    body('clothingToyPreference').optional().trim(),
    body('interests').optional().trim(),
    body('notes').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { childId } = req.params
      const {
        firstName,
        age,
        gender,
        clothingShirtSize,
        clothingPantSize,
        clothingShoeSize,
        clothingToyPreference,
        interests,
        notes
      } = req.body

      // Verify child exists
      const existingChild = await prisma.child.findUnique({
        where: { id: childId },
        include: {
          orphanage: {
            select: {
              organizerId: true
            }
          }
        }
      })

      if (!existingChild) {
        return res.status(404).json({ error: 'Child not found' })
      }

      // Verify organizer owns the orphanage
      if (existingChild.orphanage.organizerId !== req.userId) {
        return res.status(403).json({ error: 'You can only edit children in your own orphanage' })
      }

      // Build update data object (only include fields that are provided)
      const updateData = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (age !== undefined) updateData.age = age ? parseInt(age) : null
      if (gender !== undefined) updateData.gender = gender || null
      if (clothingShirtSize !== undefined) updateData.clothingShirtSize = clothingShirtSize || null
      if (clothingPantSize !== undefined) updateData.clothingPantSize = clothingPantSize || null
      if (clothingShoeSize !== undefined) updateData.clothingShoeSize = clothingShoeSize || null
      if (clothingToyPreference !== undefined) updateData.clothingToyPreference = clothingToyPreference || null
      if (interests !== undefined) updateData.interests = interests || null
      if (notes !== undefined) updateData.notes = notes || null

      // Update child
      const child = await prisma.child.update({
        where: { id: childId },
        data: updateData,
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
          },
          orphanage: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      res.json(child)
    } catch (error) {
      next(error)
    }
  }
)

// Delete child (organizer only)
router.delete(
  '/:childId',
  authenticate,
  requireRole('ORGANIZER'),
  async (req, res, next) => {
    try {
      const { childId } = req.params

      // Verify child exists
      const existingChild = await prisma.child.findUnique({
        where: { id: childId },
        include: {
          orphanage: {
            select: {
              organizerId: true
            }
          }
        }
      })

      if (!existingChild) {
        return res.status(404).json({ error: 'Child not found' })
      }

      // Verify organizer owns the orphanage
      if (existingChild.orphanage.organizerId !== req.userId) {
        return res.status(403).json({ error: 'You can only delete children from your own orphanage' })
      }

      // Delete child (this will cascade delete wishlist items)
      await prisma.child.delete({
        where: { id: childId }
      })

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

export default router

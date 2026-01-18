import express from 'express'
import { query, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Helper function to check and expire old holds
async function expireOldHolds(item) {
  if (item.status === 'HELD' && item.holdExpiresAt && new Date(item.holdExpiresAt) < new Date()) {
    await prisma.wishlistItem.update({
      where: { id: item.id },
      data: {
        status: 'AVAILABLE',
        heldByUserId: null,
        holdExpiresAt: null
      }
    })
    item.status = 'AVAILABLE'
    item.heldByUserId = null
    item.holdExpiresAt = null
  }
}

// Get wishlist items (with filtering)
router.get(
  '/items',
  [
    query('orphanageId').optional().notEmpty(),
    query('status').optional().isIn(['AVAILABLE', 'HELD', 'VERIFYING', 'PURCHASED']),
    query('childId').optional().notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { orphanageId, status, childId } = req.query

      const where = {}
      if (orphanageId) {
        where.child = { orphanageId }
      }
      if (childId) {
        where.childId = childId
      }
      if (status) {
        where.status = status
      }

      const items = await prisma.wishlistItem.findMany({
        where,
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              age: true,
              orphanageId: true,
              orphanage: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          heldBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Check and expire old holds
      for (const item of items) {
        if (item.status === 'HELD') {
          await expireOldHolds(item)
        }
      }

      res.json(items)
    } catch (error) {
      next(error)
    }
  }
)

// Get items held by current user
router.get('/items/held-by-me', authenticate, async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: {
        heldByUserId: req.userId,
        status: {
          in: ['HELD', 'VERIFYING']
        }
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            age: true,
            orphanageId: true,
            orphanage: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        heldBy: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Check and expire old holds
    const validItems = []
    for (const item of items) {
      if (item.status === 'HELD') {
        await expireOldHolds(item)
      }
      
      // Only include items that are still held or verifying after expiry check
      if (item.status === 'HELD' || item.status === 'VERIFYING') {
        validItems.push(item)
      }
    }

    res.json(validItems)
  } catch (error) {
    next(error)
  }
})

// Hold item for 24 hours (donator only)
router.post('/:itemId/hold', authenticate, requireRole('DONATOR'), async (req, res, next) => {
  try {
    const { itemId } = req.params

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        child: {
          include: {
            orphanage: true
          }
        }
      }
    })

    if (!item) {
      return res.status(404).json({ error: 'Wishlist item not found' })
    }

    // Check and expire old holds if needed
    await expireOldHolds(item)

    // Check if item is available
    if (item.status === 'PURCHASED') {
      return res.status(400).json({ error: 'Item has already been purchased' })
    }

    if (item.status === 'HELD' && item.heldByUserId !== req.userId) {
      return res.status(409).json({ error: 'Item is currently held by another donor' })
    }

    // If already held by this user, extend the hold
    if (item.status === 'HELD' && item.heldByUserId === req.userId) {
      const holdExpiresAt = new Date()
      holdExpiresAt.setHours(holdExpiresAt.getHours() + 24)

      const updatedItem = await prisma.wishlistItem.update({
        where: { id: itemId },
        data: {
          holdExpiresAt
        },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              orphanage: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          heldBy: {
            select: {
              id: true,
              displayName: true
            }
          }
        }
      })

      return res.json({
        message: 'Hold extended for 24 hours',
        item: updatedItem
      })
    }

    // Create new hold
    const holdExpiresAt = new Date()
    holdExpiresAt.setHours(holdExpiresAt.getHours() + 24)

    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        status: 'HELD',
        heldByUserId: req.userId,
        holdExpiresAt
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            orphanage: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        heldBy: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    })

    res.json({
      message: 'Item held successfully for 24 hours',
      item: updatedItem,
      holdExpiresAt: updatedItem.holdExpiresAt
    })
  } catch (error) {
    next(error)
  }
})

// Release held item (donator only - can release their own holds)
router.post('/:itemId/release', authenticate, requireRole('DONATOR'), async (req, res, next) => {
  try {
    const { itemId } = req.params

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return res.status(404).json({ error: 'Wishlist item not found' })
    }

    if (item.status !== 'HELD') {
      return res.status(400).json({ error: 'Item is not currently held' })
    }

    if (item.heldByUserId !== req.userId) {
      return res.status(403).json({ error: 'You can only release items you are holding' })
    }

    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        status: 'AVAILABLE',
        heldByUserId: null,
        holdExpiresAt: null
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            orphanage: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    res.json({
      message: 'Item released successfully',
      item: updatedItem
    })
  } catch (error) {
    next(error)
  }
})

// Delete/cancel hold (if expired or by holder)
router.delete('/:itemId/hold', authenticate, async (req, res, next) => {
  try {
    const { itemId } = req.params

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return res.status(404).json({ error: 'Wishlist item not found' })
    }

    // Check if hold is expired
    const isExpired = item.holdExpiresAt && new Date(item.holdExpiresAt) < new Date()

    // Allow deletion if: expired, or user is the holder, or user is an organizer/admin
    if (!isExpired && item.heldByUserId !== req.userId && req.userRole !== 'ORGANIZER' && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'You cannot cancel this hold' })
    }

    if (item.status === 'HELD') {
      await prisma.wishlistItem.update({
        where: { id: itemId },
        data: {
          status: 'AVAILABLE',
          heldByUserId: null,
          holdExpiresAt: null
        }
      })
    }

    res.json({ message: 'Hold cancelled successfully' })
  } catch (error) {
    next(error)
  }
})

export default router

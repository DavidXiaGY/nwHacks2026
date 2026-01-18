import express from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Submit donation with proof (donator only)
router.post(
  '/',
  authenticate,
  requireRole('DONATOR'),
  [
    body('itemId').notEmpty(),
    body('orderId').optional().trim(),
    body('proofUrl').optional().isURL(),
    body('notes').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() })
      }

      const { itemId, orderId, proofUrl, notes } = req.body

      // Find the wishlist item
      const item = await prisma.wishlistItem.findUnique({
        where: { id: itemId },
        include: {
          donation: true
        }
      })

      if (!item) {
        return res.status(404).json({ error: 'Wishlist item not found' })
      }

      // Check if already donated/verified
      if (item.status === 'PURCHASED' || item.status === 'VERIFYING') {
        return res.status(400).json({ error: 'This item has already been submitted for verification' })
      }

      // Verify the item is held by this user
      if (item.status === 'HELD' && item.heldByUserId !== req.userId) {
        return res.status(403).json({
          error: 'You must hold this item before submitting a donation'
        })
      }

      // Check if hold is expired
      if (item.status === 'HELD' && item.holdExpiresAt && new Date(item.holdExpiresAt) < new Date()) {
        return res.status(400).json({
          error: 'Your hold on this item has expired. Please hold it again before submitting donation.'
        })
      }

      // Create donation and update item status
      const donation = await prisma.$transaction(async (tx) => {
        // Create donation
        const newDonation = await tx.donation.create({
          data: {
            donorId: req.userId,
            itemId,
            orderId: orderId || null,
            proofUrl: proofUrl || null,
            notes: notes || null
          },
          include: {
            donor: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            },
            item: {
              include: {
                child: {
                  include: {
                    orphanage: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        // Update item status to VERIFYING (organizer will confirm later)
        await tx.wishlistItem.update({
          where: { id: itemId },
          data: {
            status: 'VERIFYING',
            heldByUserId: null,
            holdExpiresAt: null
          }
        })

        return newDonation
      })

      res.status(201).json({
        message: 'Donation submitted successfully',
        donation
      })
    } catch (error) {
      next(error)
    }
  }
)

// Get current user's donations
router.get('/me', authenticate, requireRole('DONATOR'), async (req, res, next) => {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        donorId: req.userId
      },
      include: {
        item: {
          include: {
            child: {
              include: {
                orphanage: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(donations)
  } catch (error) {
    next(error)
  }
})

// Get all donations for an orphanage (organizer only)
router.get('/orphanage/:orphanageId', authenticate, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const { orphanageId } = req.params

    // Verify orphanage exists and belongs to this organizer
    const orphanage = await prisma.orphanage.findUnique({
      where: { id: orphanageId }
    })

    if (!orphanage) {
      return res.status(404).json({ error: 'Orphanage not found' })
    }

    if (orphanage.organizerId !== req.userId) {
      return res.status(403).json({ error: 'You can only view donations for your own orphanage' })
    }

    // Get all wishlist items for children in this orphanage that have donations (VERIFYING or PURCHASED)
    const itemsWithDonations = await prisma.wishlistItem.findMany({
      where: {
        child: {
          orphanageId
        },
        status: {
          in: ['VERIFYING', 'PURCHASED']
        }
      },
      include: {
        donation: {
          include: {
            donor: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        },
        child: {
          select: {
            id: true,
            firstName: true,
            age: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter to only items with donations and format response
    const donations = itemsWithDonations
      .filter(item => item.donation)
      .map(item => ({
        ...item.donation,
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          externalLink: item.externalLink,
          price: item.price
        },
        child: item.child
      }))

    res.json(donations)
  } catch (error) {
    next(error)
  }
})

// Confirm/verify donation (organizer only - changes VERIFYING to PURCHASED)
router.post(
  '/:donationId/verify',
  authenticate,
  requireRole('ORGANIZER'),
  async (req, res, next) => {
    try {
      const { donationId } = req.params

      // Find the donation
      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
        include: {
          item: {
            include: {
              child: {
                include: {
                  orphanage: true
                }
              }
            }
          }
        }
      })

      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' })
      }

      // Verify orphanage belongs to this organizer
      if (donation.item.child.orphanage.organizerId !== req.userId) {
        return res.status(403).json({
          error: 'You can only verify donations for your own orphanage'
        })
      }

      // Check if item is in VERIFYING status
      if (donation.item.status !== 'VERIFYING') {
        return res.status(400).json({
          error: `Item is not in VERIFYING status. Current status: ${donation.item.status}`
        })
      }

      // Update item status to PURCHASED
      const updatedItem = await prisma.wishlistItem.update({
        where: { id: donation.itemId },
        data: {
          status: 'PURCHASED'
        },
        include: {
          child: {
            include: {
              orphanage: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          donation: {
            include: {
              donor: {
                select: {
                  id: true,
                  displayName: true,
                  email: true
                }
              }
            }
          }
        }
      })

      res.json({
        message: 'Donation verified successfully. Item status changed to PURCHASED.',
        item: updatedItem
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router

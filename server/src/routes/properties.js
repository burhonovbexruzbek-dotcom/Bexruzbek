import { Router } from 'express'
import { z } from 'zod'
import Dacha from '../models/Dacha.js'
import Booking from '../models/Booking.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
const dachaSchema = z.object({
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().min(1).max(20),
  bedrooms: z.number().int().min(0).max(30),
  bathrooms: z.number().int().min(0).max(30),
  amenities: z.array(z.string().trim().max(50)).max(40).default([]),
  photos: z.array(z.url()).max(30).default([]),
  isPublished: z.boolean().default(true),
})

router.get('/', async (req, res, next) => {
  try {
    const filter = { isPublished: true }
    if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) }
    if (req.query.guests) filter.maxGuests = { $gte: Math.min(20, Math.max(1, Number(req.query.guests) || 1)) }
    const dachas = await Dacha.find(filter).sort({ rating: -1, createdAt: -1 }).lean()
    let statuses = {}
    if (req.query.checkIn && req.query.checkOut) {
      const checkIn = new Date(String(req.query.checkIn))
      const checkOut = new Date(String(req.query.checkOut))
      if (!Number.isFinite(checkIn.valueOf()) || !Number.isFinite(checkOut.valueOf()) || checkOut <= checkIn) return res.status(400).json({ error: 'Sanalar noto‘g‘ri.' })
      const conflicts = await Booking.find({ dacha: { $in: dachas.map((item) => item._id) }, status: 'confirmed', checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }).select('dacha')
      const busy = new Set(conflicts.map((booking) => booking.dacha.toString()))
      statuses = Object.fromEntries(dachas.map((item) => [item._id.toString(), busy.has(item._id.toString()) ? 'booked' : 'available']))
    }
    res.json({ items: dachas, availability: statuses })
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const dacha = await Dacha.findOne({ _id: req.params.id, isPublished: true }).lean()
    if (!dacha) return res.status(404).json({ error: 'Dacha topilmadi.' })
    res.json({ item: dacha })
  } catch (error) { next(error) }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ item: await Dacha.create(dachaSchema.parse(req.body)) }) } catch (error) { next(error) }
})
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = dachaSchema.partial().parse(req.body)
    const item = await Dacha.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ error: 'Dacha topilmadi.' })
    res.json({ item })
  } catch (error) { next(error) }
})
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Dacha.findByIdAndUpdate(req.params.id, { isPublished: false }, { new: true })
    if (!item) return res.status(404).json({ error: 'Dacha topilmadi.' })
    res.json({ item })
  } catch (error) { next(error) }
})

export default router

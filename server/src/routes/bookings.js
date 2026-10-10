import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import Booking from '../models/Booking.js'
import Dacha from '../models/Dacha.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { setBookingStatus } from '../services/bookingService.js'

const router = Router()
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const requestSchema = z.object({
  dachaId: z.string().min(1),
  guestName: z.string().trim().min(2).max(100),
  guestPhone: z.string().trim().regex(/^\+?[0-9\s()-]{9,24}$/),
  checkIn: dateOnly,
  checkOut: dateOnly,
  guests: z.number().int().min(1).max(20),
})
const utcDate = (date) => new Date(`${date}T00:00:00.000Z`)

router.post('/', async (req, res, next) => {
  try {
    const input = requestSchema.parse(req.body)
    const checkIn = utcDate(input.checkIn)
    const checkOut = utcDate(input.checkOut)
    if (checkOut <= checkIn) return res.status(400).json({ error: 'Ketish sanasi kelish sanasidan keyin bo‘lishi kerak.' })
    const dacha = await Dacha.findOne({ _id: input.dachaId, isPublished: true })
    if (!dacha) return res.status(404).json({ error: 'Dacha topilmadi.' })
    if (input.guests > dacha.maxGuests) return res.status(400).json({ error: `Bu dacha ko‘pi bilan ${dacha.maxGuests} mehmon uchun.` })
    const nights = Math.round((checkOut - checkIn) / 86400000)
    const booking = await Booking.create({
      bookingNumber: `DS-${randomUUID().slice(0, 8).toUpperCase()}`,
      dacha: dacha._id,
      user: req.user?._id || null,
      guestName: input.guestName,
      guestPhone: input.guestPhone,
      checkIn,
      checkOut,
      guests: input.guests,
      nights,
      totalPrice: dacha.pricePerNight * nights,
      status: 'pending',
    })
    res.status(201).json({ booking, message: 'Bron so‘rovi yuborildi. Tasdiqlash admin tomonidan amalga oshiriladi.' })
  } catch (error) { next(error) }
})

router.get('/mine', requireAuth, async (req, res, next) => {
  try { res.json({ items: await Booking.find({ user: req.user._id }).populate('dacha', 'name location photos pricePerNight').sort({ createdAt: -1 }) }) } catch (error) { next(error) }
})
router.get('/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.q) filter.$or = [{ guestName: { $regex: String(req.query.q).slice(0, 80), $options: 'i' } }, { guestPhone: { $regex: String(req.query.q).slice(0, 40), $options: 'i' } }]
    const [items, total, revenue] = await Promise.all([
      Booking.find(filter).populate('dacha', 'name location').populate('user', 'name email').sort({ createdAt: -1 }).limit(250),
      Booking.countDocuments(),
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ])
    res.json({ items, stats: { totalBookings: total, confirmedRevenue: revenue[0]?.total || 0 } })
  } catch (error) { next(error) }
})
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['confirmed', 'cancelled']) }).parse(req.body)
    const booking = await setBookingStatus(req.params.id, status)
    res.json({ booking })
  } catch (error) { next(error) }
})

export default router

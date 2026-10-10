import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Dacha from '../models/Dacha.js'

export function datesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && firstEnd > secondStart
}

export async function setBookingStatus(bookingId, status) {
  const session = await mongoose.startSession()
  let result
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session)
      if (!booking) {
        const error = new Error('Bron topilmadi.')
        error.status = 404
        throw error
      }
      if (booking.status === status) {
        result = booking
        return
      }
      if (status === 'confirmed') {
        const dacha = await Dacha.findByIdAndUpdate(booking.dacha, { $inc: { availabilityLock: 1 } }, { new: true, session })
        if (!dacha) {
          const error = new Error('Dacha topilmadi.')
          error.status = 404
          throw error
        }
        const overlap = await Booking.exists({
          _id: { $ne: booking._id },
          dacha: booking.dacha,
          status: 'confirmed',
          checkIn: { $lt: booking.checkOut },
          checkOut: { $gt: booking.checkIn },
        }).session(session)
        if (overlap) {
          const error = new Error('Tanlangan sanalarda tasdiqlangan boshqa bron mavjud.')
          error.status = 409
          throw error
        }
      }
      booking.status = status
      await booking.save({ session })
      result = booking
    }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
  } finally {
    await session.endSession()
  }
  return result
}

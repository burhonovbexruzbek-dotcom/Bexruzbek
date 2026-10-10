import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true, index: true },
  dacha: { type: mongoose.Schema.Types.ObjectId, ref: 'Dacha', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  guestName: { type: String, required: true, trim: true, maxlength: 100 },
  guestPhone: { type: String, required: true, trim: true, maxlength: 24 },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1, max: 20 },
  nights: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending', index: true },
}, { timestamps: true })

bookingSchema.index({ dacha: 1, status: 1, checkIn: 1, checkOut: 1 })
export default mongoose.model('Booking', bookingSchema)

import mongoose from 'mongoose'

const dachaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 4000 },
  pricePerNight: { type: Number, required: true, min: 1 },
  maxGuests: { type: Number, required: true, min: 1, max: 20 },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  amenities: { type: [String], default: [] },
  photos: { type: [String], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  isPublished: { type: Boolean, default: true },
  availabilityLock: { type: Number, default: 0 },
}, { timestamps: true })

dachaSchema.index({ isPublished: 1, location: 1 })
dachaSchema.index({ name: 'text', location: 'text', description: 'text' })
export default mongoose.model('Dacha', dachaSchema)

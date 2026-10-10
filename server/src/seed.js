import 'dotenv/config'
import mongoose from 'mongoose'
import Dacha from './models/Dacha.js'

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI server/.env faylida sozlanishi kerak.')
await mongoose.connect(process.env.MONGODB_URI)
const examples = [
  { name: 'Mountain View Villa', location: 'Chorvoq, Toshkent viloyati', description: 'Tog‘lar bag‘rida joylashgan zamonaviy villa. Keng hovli, moviy basseyn va sokin tabiat qo‘ynida unutilmas dam oling.', pricePerNight: 2500000, maxGuests: 10, bedrooms: 4, bathrooms: 3, amenities: ['Basseyn', 'Wi-Fi', 'Barbekyu', 'Avtoturargoh'], photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'], rating: 4.9, reviewCount: 48 },
  { name: 'Forest Harmony Chalet', location: 'Chorvoq, Toshkent viloyati', description: 'Yashil daraxtlar orasidagi shinam chalet. Sauna, basseyn va oilaviy hordiq uchun barcha qulayliklar mavjud.', pricePerNight: 3200000, maxGuests: 8, bedrooms: 3, bathrooms: 2, amenities: ['Basseyn', 'Wi-Fi', 'Sauna', 'Barbekyu'], photos: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85'], rating: 4.7, reviewCount: 32 },
  { name: 'Sunset Paradise', location: 'O‘rtachirchiq, Toshkent viloyati', description: 'Quyosh botishini tomosha qilish uchun ideal maskan. Yaqinlaringiz bilan shahar shovqinidan uzoqda dam oling.', pricePerNight: 1800000, maxGuests: 6, bedrooms: 3, bathrooms: 2, amenities: ['Basseyn', 'Wi-Fi', 'Barbekyu', 'Avtoturargoh'], photos: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85'], rating: 4.8, reviewCount: 21 },
]
for (const dacha of examples) await Dacha.updateOne({ name: dacha.name }, { $setOnInsert: dacha }, { upsert: true })
console.log(`Seeded ${examples.length} sample properties (existing entries were preserved).`)
await mongoose.disconnect()

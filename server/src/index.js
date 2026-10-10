import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import { ZodError } from 'zod'
import authRoutes from './routes/auth.js'
import propertyRoutes from './routes/properties.js'
import bookingRoutes from './routes/bookings.js'

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('MONGODB_URI va kamida 32 belgili JWT_SECRET server/.env faylida sozlanishi kerak.')
}

const app = express()
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim()) || 'http://localhost:5173' }))
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/dachas', propertyRoutes)
app.use('/api/bookings', bookingRoutes)
app.use((req, res) => res.status(404).json({ error: `Yo‘l topilmadi: ${req.method} ${req.path}` }))
app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Kiritilgan ma’lumotlarni tekshiring.', details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })) })
  if (error?.name === 'CastError') return res.status(400).json({ error: 'ID formati noto‘g‘ri.' })
  if (error?.code === 11000) return res.status(409).json({ error: 'Bu ma’lumot avval ishlatilgan.' })
  const status = error.status || 500
  if (status >= 500) console.error(error)
  res.status(status).json({ error: status >= 500 ? 'Serverda xatolik yuz berdi.' : error.message })
})

const port = Number(process.env.PORT) || 4000
await mongoose.connect(process.env.MONGODB_URI)
app.listen(port, () => console.log(`DachaStay API http://localhost:${port}`))

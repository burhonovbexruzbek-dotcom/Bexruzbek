import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return next()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.sub).select('_id name email role')
  } catch {
    req.user = undefined
  }
  next()
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Tizimga kirish talab qilinadi.' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.sub).select('_id name email role')
    if (!req.user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi.' })
    next()
  } catch {
    res.status(401).json({ error: 'Sessiya yaroqsiz yoki muddati tugagan.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Administrator ruxsati talab qilinadi.' })
  next()
}

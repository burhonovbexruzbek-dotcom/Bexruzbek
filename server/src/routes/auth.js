import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'

const router = Router()
const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{9,24}$/),
  email: z.email().max(254),
  password: z.string().min(10).max(128),
})
const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(128) })
const publicUser = (user) => ({ id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role })
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' })

router.post('/register', async (req, res, next) => {
  try {
    const input = registrationSchema.parse(req.body)
    const passwordHash = await bcrypt.hash(input.password, Number(process.env.BCRYPT_ROUNDS) || 12)
    const user = await User.create({ ...input, passwordHash })
    res.status(201).json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: 'Bu email bilan hisob mavjud.' })
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body)
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'Email yoki parol noto‘g‘ri.' })
    res.json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) { next(error) }
})

export default router

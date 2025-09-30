import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

// GET semua departemen
router.get('/', async (req, res) => {
  try {
    const depts = await prisma.department.findMany()
    res.json(depts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal ambil data departemen' })
  }
})

export default router

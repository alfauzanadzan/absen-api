import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

// Absen masuk
router.post("/checkin", async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: "userId wajib dikirim" })

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        status: "HADIR",
        timeIn: new Date(),
      },
    })

    res.json(attendance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Lihat semua data attendance
router.get("/", async (req, res) => {
  const data = await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
  res.json(data)
})

export default router

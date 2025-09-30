import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// ✅ Ambil semua user + department name
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true, // ambil relasi department
      },
    });

    // Mapping biar FE gampang konsumsi
    const result = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      role: u.role,
      position: u.position,
      departmentId: u.departmentId,
      departmentName: u.department?.name || u.departmentName || null, // ✅ return text
      createdAt: u.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Tambah user baru
router.post("/", async (req, res) => {
  try {
    const { username, email, password, name, role, position, departmentId } = req.body;

    const department = departmentId
      ? await prisma.department.findUnique({ where: { id: departmentId } })
      : null;

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password,
        name,
        role,
        position,
        departmentId,
        departmentName: department?.name || null, // ✅ simpan text department
      },
    });

    res.json(newUser);
  } catch (err) {
    console.error("Error create user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;

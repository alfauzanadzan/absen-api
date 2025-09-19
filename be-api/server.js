import express from "express"
import cors from "cors"
import attendanceRoutes from "./routes/attendance.js"

const app = express()
app.use(cors())
app.use(express.json())

// pakai router attendance
app.use("/attendance", attendanceRoutes)

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000")
})

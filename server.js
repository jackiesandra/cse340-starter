// ==============================================
// 🚀 Servidor principal de CSE Motors
// ==============================================

require("dotenv").config()

const express = require("express")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")

const baseController = require("./controllers/baseController")
const invRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")

const app = express()

// ==============================================
// ⚙️ Configuración de vistas EJS + Layouts
// ==============================================
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// ==============================================
// 🧩 Middleware para manejar formularios y JSON
// ==============================================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ==============================================
// 🗂️ Servir archivos estáticos (CSS, imágenes, JS)
// ==============================================
app.use(express.static(path.join(__dirname, "public")))

// ==============================================
// 🌍 Variables de entorno y puerto
// ==============================================
const PORT = process.env.PORT || 3000
console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "undefined")
console.log("🔗 DATABASE_URL:", process.env.DATABASE_URL ? "definida ✅" : "❌ undefined")

// ==============================================
// 🏠 Rutas principales
// ==============================================
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", invRoute)

// ==============================================
// ⚠️ Middleware para manejar 404
// ==============================================
app.use((req, res, next) => {
  const err = new Error("The page you are looking for does not exist.")
  err.status = 404
  next(err)
})

// ==============================================
// 💥 Middleware general de manejo de errores (404/500/etc.)
// ==============================================
app.use(async (err, req, res, next) => {
  try {
    console.error("💥 Error general capturado:", err?.stack || err)

    const nav = await utilities.getNav()
    const status = err.status || 500

    res.status(status).render("errors/error", {
      title: status === 404 ? "404 - Not Found" : "Server Error",
      message: err.message || "Something went wrong. Please try again later.",
      nav,
    })
  } catch (e) {
    console.error("💥 Error dentro del error handler:", e)
    res.status(500).send("Server Error")
  }
})

// ==============================================
// 🧰 Manejo global de errores no capturados
// ==============================================
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
})

// ==============================================
// ▶️ ARRANQUE DEL SERVIDOR
// ==============================================
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`)
})

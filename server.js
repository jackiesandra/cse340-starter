// ==============================================
// 🚀 Servidor principal de CSE Motors
// ==============================================

// Cargar variables de entorno
require("dotenv").config()

// Importar dependencias
const express = require("express")
const path = require("path")
const baseController = require("./controllers/baseController")
const invRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")

// Crear instancia de Express
const app = express()

// ==============================================
// ⚙️ Configuración de vistas EJS
// ==============================================
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// ==============================================
// 🧩 Middleware para manejar formularios y JSON
// ==============================================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ==============================================
// 🗂️ Servir archivos estáticos
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
app.get("/", utilities.handleErrors(baseController.buildHome)) // Página principal con error handling
app.use("/inv", invRoute) // Rutas del inventario

// ==============================================
// ⚠️ Middleware para manejar 404 (manda al error handler)
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
  console.error("💥 Error general capturado:", err.stack)

  const nav = await utilities.getNav()
  const status = err.status || 500

  res.status(status).render("errors/error", {
    title: status === 404 ? "404 - Not Found" : "Server Error",
    message: err.message || "Something went wrong. Please try again later.",
    nav,
  })
})

// ==============================================
// 🧰 Manejo global de errores no capturados
// ==============================================
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
  process.exit(1)
})

/app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en el puerto: ${PORT}`)
})

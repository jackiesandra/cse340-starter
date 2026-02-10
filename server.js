// ==============================================
// 🚀 Servidor principal de CSE Motors
// ==============================================
require("dotenv").config()

const express = require("express")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")

// Sessions & Messages
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const pool = require("./database")

// Controllers / Routes
const baseController = require("./controllers/baseController")
const invRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

// Utilities
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
// 🍪 Cookies (NECESARIO para JWT en cookie)
// ==============================================
app.use(cookieParser())

// ✅ Needed behind Render/Heroku proxy for secure cookies
app.set("trust proxy", 1)

// ==============================================
// 🔐 Sessions (guardadas en PostgreSQL)
// ==============================================
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
)

// ==============================================
// 💬 Flash Messages + Express Messages
// ==============================================
app.use(require("connect-flash")())
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// ==============================================
// ✅ JWT Middleware GLOBAL (setea res.locals.loggedin + accountData)
// ==============================================
app.use(utilities.checkJWTToken)

// ==============================================
// 🗂️ Archivos estáticos
// ==============================================
app.use(express.static(path.join(__dirname, "public")))

// ==============================================
// 🌍 Variables de entorno y puerto
// ==============================================
const PORT = process.env.PORT || 3000
if (process.env.NODE_ENV !== "production") {
  console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "undefined")
  console.log("🔗 DATABASE_URL:", process.env.DATABASE_URL ? "definida ✅" : "❌ undefined")
}

// ==============================================
// 🏠 Rutas principales
// ==============================================
app.get("/", utilities.handleErrors(baseController.buildHome))

app.use("/inv", invRoute)
app.use("/account", accountRoute)

// ==============================================
// ⚠️ 404
// ==============================================
app.use((req, res, next) => {
  const err = new Error("The page you are looking for does not exist.")
  err.status = 404
  next(err)
})

// ==============================================
// 💥 Error handler
// ==============================================
app.use(async (err, req, res, next) => {
  console.error("💥 Error general capturado:", err?.stack || err)

  const nav = await utilities.getNav()
  const status = err.status || 500

  res.status(status).render("errors/error", {
    title: status === 404 ? "404 - Not Found" : "Server Error",
    message: err.message || "Something went wrong. Please try again later.",
    nav,
  })
})

// ==============================================
// ▶️ Arranque
// ==============================================
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`)
})

// ==============================
// 📦 Configuración de la base de datos PostgreSQL
// ==============================
require("dotenv").config()
const { Pool } = require("pg")

const connectionString = process.env.DATABASE_URL

console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "no definido")
console.log("🔗 DATABASE_URL:", connectionString ? "definida ✅" : "❌ no definida")

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Revisa tu archivo .env y que estés corriendo el server desde la raíz del proyecto."
  )
}

// ✅ Render requiere SSL incluso desde local en muchos casos
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

// 🔍 Probar conexión inicial (sin tumbar el server si falla)
pool
  .connect()
  .then((client) => {
    console.log("✅ Conexión exitosa a PostgreSQL.")
    client.release()
  })
  .catch((err) => {
    console.error("❌ Error al conectar a PostgreSQL:", err.message)
  })

module.exports = pool

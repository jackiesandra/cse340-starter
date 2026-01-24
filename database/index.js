// ==============================
// 📦 Configuración de la base de datos PostgreSQL
// ==============================

require("dotenv").config()
const { Pool } = require("pg")

console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "no definido")
console.log("🔗 DATABASE_URL:", process.env.DATABASE_URL ? "definida ✅" : "❌ no definida")

// Crear conexión al pool de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// 🔍 Probar conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error al conectar a PostgreSQL:", err.stack)
  } else {
    console.log("✅ Conexión exitosa a PostgreSQL.")
    release()
  }
})

// Exportar el pool directamente
module.exports = pool

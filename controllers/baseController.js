// ==============================================
// 🧭 Base Controller
// Archivo: controllers/baseController.js
// Función: Controlar las rutas principales (Home page)
// ==============================================

const utilities = require("../utilities/")

const baseController = {}

/* ***********************************************
 *  Renderizar la página principal (Home)
 * *********************************************** */
baseController.buildHome = async function (req, res, next) {
  const nav = await utilities.getNav()

  res.render("index", {
    title: "Home",
    nav,
  })
}

module.exports = baseController

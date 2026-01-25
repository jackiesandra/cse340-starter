const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Mostrar vehículos por clasificación
router.get(
  "/type/:classification_id",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Mostrar detalle de vehículo por ID
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

// Ruta para probar error 500 (intencional)
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

module.exports = router

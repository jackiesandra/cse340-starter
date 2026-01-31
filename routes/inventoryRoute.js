const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// ✅ Validation middleware (A4)
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 * Task 1: Management view
 * Route: /inv/
 * ************************** */
router.get("/", utilities.handleErrors(invController.buildManagement))

/* ***************************
 * Task 2: Add Classification
 * ************************** */
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 * Task 3: Add Inventory
 * ************************** */
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ***************************
 * Existing routes
 * ************************** */
router.get(
  "/type/:classification_id",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

module.exports = router

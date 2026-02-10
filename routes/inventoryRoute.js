const express = require("express")
const router = express.Router()

const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 * Inventory Management (PROTEGIDO - Employee/Admin)
 * ************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildManagement)
)

/* ***************************
 * Add Classification (PROTEGIDO)
 * ************************** */
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 * Add Inventory (PROTEGIDO)
 * ************************** */
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ***************************
 * Public (NO proteger)
 * ************************** */
router.get("/type/:classification_id", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId))

router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router

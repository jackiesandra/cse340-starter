const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* **************************************
 * Clasificación
 * ************************************** */
invController.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = Number(req.params.classification_id)

    if (!Number.isInteger(classification_id) || classification_id <= 0) {
      const err = new Error("Invalid classification id.")
      err.status = 404
      return next(err)
    }

    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    if (!data || data.length === 0) {
      const err = new Error("No vehicles were found for this classification.")
      err.status = 404
      return next(err)
    }

    const grid = utilities.buildClassificationGrid(data)
    const className = data[0].classification_name

    res.render("inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
    })
  } catch (err) {
    next(err)
  }
}

/* **************************************
 * Detail
 * ************************************** */
invController.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id)

    // ✅ evita NaN
    if (!Number.isInteger(inv_id) || inv_id <= 0) {
      const err = new Error("Vehicle not found.")
      err.status = 404
      return next(err)
    }

    const vehicle = await invModel.getVehicleById(inv_id)

    if (!vehicle) {
      const err = new Error("Sorry, we couldn't find that vehicle.")
      err.status = 404
      return next(err)
    }

    const nav = await utilities.getNav()

    // ✅ utilities envuelve el HTML (requisito)
    const vehicleHtml = utilities.buildVehicleHTML(vehicle)

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
    })
  } catch (err) {
    next(err)
  }
}

/* **************************************
 * Error intencional 500
 * ************************************** */
invController.triggerError = async function (req, res, next) {
  throw new Error("Intentional Server Error!")
}

module.exports = invController

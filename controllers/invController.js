const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* **************************************
 * Clasificación
 * ************************************** */
invController.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = Number(req.params.classification_id)
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    if (!data || data.length === 0) {
      return res.status(404).render("errors/error", {
        title: "No Vehicles Found",
        message: "No vehicles were found for this classification.",
        nav,
      })
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
    const vehicle = await invModel.getVehicleById(inv_id)
    const nav = await utilities.getNav()

    if (!vehicle) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, we couldn't find that vehicle.",
        nav,
      })
    }

    const html = utilities.buildVehicleHTML(vehicle)

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      html,
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

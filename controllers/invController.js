const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* **************************************
 * Build inventory by classification view
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

    return res.render("inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Build detail view by inventory id
 * ************************************** */
invController.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id)

    if (!Number.isInteger(inv_id) || inv_id <= 0) {
      const err = new Error("Vehicle not found.")
      err.status = 404
      return next(err)
    }

    // ✅ IMPORTANTE: nombre correcto del modelo (starter suele usar getInventoryById)
    const vehicle = await invModel.getInventoryById(inv_id)

    if (!vehicle) {
      const err = new Error("Sorry, we couldn't find that vehicle.")
      err.status = 404
      return next(err)
    }

    const nav = await utilities.getNav()
    const vehicleHtml = utilities.buildVehicleHTML(vehicle)

    return res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Task 1: Inventory Management view (GET)
 * Route: /inv/
 * ************************************** */
invController.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Task 2: Add Classification view (GET)
 * ************************************** */
invController.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: "",
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Task 2: Add Classification (POST)
 * ************************************** */
invController.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.flash("notice", "New classification added successfully.")
      return res.redirect("/inv/")
    }

    req.flash("notice", "Sorry, the classification could not be added.")
    const nav = await utilities.getNav()
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Task 3: Add Inventory view (GET)
 * ************************************** */
invController.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    // ✅ nombre consistente con el starter / validators (classificationSelect)
    const classificationSelect = await utilities.buildClassificationList()

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,

      // Sticky defaults
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Task 3: Add Inventory (POST)
 * ************************************** */
invController.addInventory = async function (req, res, next) {
  try {
    const data = req.body
    const result = await invModel.addInventory(data)

    if (result) {
      req.flash("notice", "New inventory item added successfully.")
      return res.redirect("/inv/")
    }

    req.flash("notice", "Sorry, the inventory item could not be added.")
    const nav = await utilities.getNav()

    // ✅ sticky select
    const classificationSelect = await utilities.buildClassificationList(
      data.classification_id
    )

    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,

      // Sticky values
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_description: data.inv_description,
      inv_image: data.inv_image,
      inv_thumbnail: data.inv_thumbnail,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      classification_id: data.classification_id,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Intentional 500 error route
 * ************************************** */
invController.triggerError = async function (req, res) {
  throw new Error("Intentional Server Error!")
}

module.exports = invController

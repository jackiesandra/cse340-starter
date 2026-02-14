const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const favoriteModel = require("../models/favorite-model")
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

    // ✅ Tu modelo se llama getVehicleById
    const vehicle = await invModel.getVehicleById(inv_id)

    if (!vehicle) {
      const err = new Error("Sorry, we couldn't find that vehicle.")
      err.status = 404
      return next(err)
    }

    const nav = await utilities.getNav()

    // ✅ CORRECTO: tu utilities tiene buildVehicleHTML
    const vehicleHtml = utilities.buildVehicleHTML(vehicle)

    // Reviews
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    const reviewSummary = await reviewModel.getReviewSummary(inv_id)

    // Favorites
    let favorite = false
    if (res.locals.loggedin && res.locals.accountData?.account_id) {
      favorite = await favoriteModel.isFavorite(
        res.locals.accountData.account_id,
        inv_id
      )
    }

    return res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
      inv_id,
      reviews,
      reviewSummary,
      favorite,
    })
  } catch (err) {
    return next(err)
  }
}

/* **************************************
 * Inventory Management view
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
 * Add Classification view
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
 * Add Classification (POST)
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
 * Add Inventory view
 * ************************************** */
invController.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,
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
 * Add Inventory (POST)
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
    const classificationSelect = await utilities.buildClassificationList(
      data.classification_id
    )

    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,
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
 * Intentional 500 Error
 * ************************************** */
invController.triggerError = async function (req, res) {
  throw new Error("Intentional Server Error!")
}

module.exports = invController

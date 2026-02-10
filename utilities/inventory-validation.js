const { body, validationResult } = require("express-validator")
const utilities = require("./index")

const invValidate = {}

/* *******************************
 * Add Classification rules
 * ******************************* */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed (letters/numbers only)."),
  ]
}

invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  const { classification_name } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      // ✅ pass the validationResult so views can use errors.array()
      errors,
      classification_name,
    })
  }
  next()
}

/* *******************************
 * Add Inventory rules
 * ******************************* */
invValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification.")
      .isInt()
      .withMessage("Invalid classification."),

    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),

    body("inv_year")
      .trim()
      .isInt({ min: 1886, max: 2100 })
      .withMessage("Year must be a valid number."),

    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a whole number."),

    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ]
}

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      // ✅ same pattern as above
      errors,

      // sticky fields
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }

  next()
}

module.exports = invValidate

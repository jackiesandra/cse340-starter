const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")

const validate = {}

/* ========================================
 * REGISTRATION VALIDATION
 * ======================================== */
validate.registrationRules = () => [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("Please provide a first name."),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Please provide a last name."),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (email) => {
      const exists = await accountModel.checkExistingEmail(email)
      if (exists) {
        throw new Error("Email exists. Please log in or use a different email.")
      }
      return true
    }),

  body("password")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{12,}$/)
    .withMessage(
      "Password must be 12+ characters and include uppercase, lowercase, number, and special character."
    ),
]

validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
    })
  }
  next()
}

/* ========================================
 * LOGIN VALIDATION  ✅ (errors como ARRAY)
 * ======================================== */
validate.loginRules = () => [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required."),
]

validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(), // ✅ AQUÍ ESTÁ EL CAMBIO CLAVE
      email: req.body.email,
    })
  }
  next()
}

/* ========================================
 * ACCOUNT UPDATE VALIDATION
 * ======================================== */
validate.accountUpdateRules = () => [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const account_id = Number(req.body.account_id)
      const existing = await accountModel.getAccountByEmail(email)
      if (existing && Number(existing.account_id) !== account_id) {
        throw new Error("Email already exists. Please use a different email.")
      }
      return true
    }),
]

validate.checkAccountUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
    })
  }
  next()
}

/* ========================================
 * PASSWORD UPDATE VALIDATION
 * ======================================== */
validate.updatePasswordRules = () => [
  body("account_password")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{12,}$/)
    .withMessage(
      "Password must be 12+ characters and include uppercase, lowercase, number, and special character."
    ),
]

validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const account_id = Number(req.body.account_id)
    const accountData = await accountModel.getAccountById(account_id)

    return res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_id: accountData.account_id,
      first_name: accountData.first_name,
      last_name: accountData.last_name,
      email: accountData.email,
    })
  }
  next()
}

/* ========================================
 * Compatibility (por si alguna ruta vieja llama esto)
 * ======================================== */
validate.passwordRules = validate.updatePasswordRules
validate.checkPasswordData = validate.checkUpdatePasswordData

module.exports = validate

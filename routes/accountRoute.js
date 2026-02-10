const express = require("express")
const router = express.Router()

const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")
const utilities = require("../utilities")

router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.accountUpdateRules(),
  accountValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  utilities.checkLogin,
  accountValidate.updatePasswordRules(),
  accountValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

router.get("/logout", utilities.checkLogin, accountController.logout)

module.exports = router

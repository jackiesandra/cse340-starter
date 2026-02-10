const accountModel = require("../models/account-model")
const utilities = require("../utilities")

/* =========================
 * GET: Register view
 * ========================= */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  return res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    first_name: "",
    last_name: "",
    email: "",
  })
}

/* =========================
 * POST: Register account
 * ========================= */
async function registerAccount(req, res) {
  const { first_name, last_name, email, password } = req.body
  const nav = await utilities.getNav()

  try {
    const exists = await accountModel.checkExistingEmail(email)
    if (exists) {
      req.flash("notice", "That email already exists. Please log in.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email,
      })
    }

    const hashedPassword = utilities.hashPassword(password)
    const result = await accountModel.registerAccount(first_name, last_name, email, hashedPassword)

    if (result) {
      req.flash("notice", `Congratulations, you're registered ${first_name}. Please log in.`)
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email: "",
      })
    }

    req.flash("notice", "Sorry, the registration failed.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      first_name,
      last_name,
      email,
    })
  } catch (error) {
    console.error(error)
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      first_name,
      last_name,
      email,
    })
  }
}

/* =========================
 * GET: Login view
 * ========================= */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  return res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    email: "",
  })
}

/* =========================
 * POST: Login process (creates JWT cookie)
 * ========================= */
async function accountLogin(req, res) {
  const { email, password } = req.body
  const nav = await utilities.getNav()

  try {
    const accountData = await accountModel.getAccountByEmail(email)

    if (!accountData) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email,
      })
    }

    const match = utilities.comparePassword(password, accountData.password)
    if (!match) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email,
      })
    }

    // ✅ Payload used by header + management + role middleware
    const safeAccountData = {
      account_id: accountData.account_id,
      first_name: accountData.first_name,
      last_name: accountData.last_name,
      email: accountData.email,
      account_type: accountData.account_type,
    }

    const token = utilities.signToken(safeAccountData)

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    })

    req.flash("notice", "Welcome!")
    return res.redirect("/account/")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Login failed. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      email,
    })
  }
}

/* =========================
 * GET: Account management view
 * Use JWT locals for greeting/role display
 * ========================= */
async function buildManagement(req, res) {
  if (!res.locals.loggedin || !res.locals.accountData?.account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const nav = await utilities.getNav()

  // optional: fetch fresh info if you display more than greeting
  const accountInfo = await accountModel.getAccountById(res.locals.accountData.account_id)

  return res.render("account/management", {
    title: "Account Management",
    nav,
    accountInfo, // optional
  })
}

/* =========================
 * GET: Update account view
 * ========================= */
async function buildUpdateAccount(req, res) {
  if (!res.locals.loggedin || !res.locals.accountData?.account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const nav = await utilities.getNav()
  const account_id = Number(req.params.account_id)
  const loggedInId = Number(res.locals.accountData.account_id)

  if (account_id !== loggedInId) {
    req.flash("notice", "You can only edit your own account.")
    return res.redirect("/account/")
  }

  const accountData = await accountModel.getAccountById(account_id)

  return res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    first_name: accountData.first_name,
    last_name: accountData.last_name,
    email: accountData.email,
  })
}

/* =========================
 * POST: Update account info
 * Refresh JWT after update
 * ========================= */
async function updateAccount(req, res) {
  if (!res.locals.loggedin || !res.locals.accountData?.account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const nav = await utilities.getNav()
  const { account_id, first_name, last_name, email } = req.body

  const loggedInId = Number(res.locals.accountData.account_id)
  if (Number(account_id) !== loggedInId) {
    req.flash("notice", "You can only edit your own account.")
    return res.redirect("/account/")
  }

  try {
    const updated = await accountModel.updateAccountInfo(account_id, first_name, last_name, email)

    if (!updated) {
      req.flash("notice", "Account update failed.")
      return res.status(500).render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_id,
        first_name,
        last_name,
        email,
      })
    }

    // ✅ Always re-query to keep account_type consistent
    const fresh = await accountModel.getAccountById(account_id)

    const safeAccountData = {
      account_id: fresh.account_id,
      first_name: fresh.first_name,
      last_name: fresh.last_name,
      email: fresh.email,
      account_type: fresh.account_type,
    }

    const token = utilities.signToken(safeAccountData)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    })

    req.flash("notice", "Account updated successfully.")
    return res.redirect("/account/")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Account update failed.")
    return res.status(500).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      first_name,
      last_name,
      email,
    })
  }
}

/* =========================
 * POST: Update password
 * Expects: account_password
 * ========================= */
async function updatePassword(req, res) {
  if (!res.locals.loggedin || !res.locals.accountData?.account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const { account_id, account_password } = req.body

  const loggedInId = Number(res.locals.accountData.account_id)
  if (Number(account_id) !== loggedInId) {
    req.flash("notice", "You can only update your own password.")
    return res.redirect("/account/")
  }

  try {
    const hashed = utilities.hashPassword(account_password)
    const ok = await accountModel.updatePassword(account_id, hashed)

    req.flash("notice", ok ? "Password updated successfully." : "Password update failed.")
    return res.redirect("/account/")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Password update failed.")
    return res.redirect("/account/")
  }
}

/* =========================
 * GET: Logout
 * ========================= */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logout,
}

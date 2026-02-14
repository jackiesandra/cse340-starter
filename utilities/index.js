const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const Util = {}

/* =========================
 * Helpers
 * ========================= */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

Util.hashPassword = (plainPassword) => bcrypt.hashSync(plainPassword, 10)
Util.comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword)

Util.signToken = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

/* =========================
 * ✅ Flash Messages Helper (FIXED)
 * Use in EJS: <%- messages() %>
 * - No <li> wrappers
 * - Clean HTML output
 * ========================= */
Util.messages = (req, res, next) => {
  res.locals.messages = () => {
    const notices = req.flash("notice")

    if (!notices || notices.length === 0) return ""

    // Build clean blocks (no UL/LI)
    const html = notices
      .map((msg) => `<div class="notice">${msg}</div>`)
      .join("")

    return html
  }
  next()
}

/* =========================
 * NAV
 * ========================= */
Util.getNav = async function () {
  const data = await invModel.getClassifications()

  let nav = `
    <nav class="site-nav" aria-label="Primary navigation">
      <ul class="nav-list">
        <li><a class="nav-link" href="/" title="Home page">Home</a></li>
  `

  data.forEach((row) => {
    nav += `
      <li>
        <a class="nav-link" href="/inv/type/${row.classification_id}"
           title="View our ${row.classification_name} vehicles">
          ${row.classification_name}
        </a>
      </li>
    `
  })

  nav += `
      </ul>
    </nav>
  `
  return nav
}

/* =========================
 * ✅ Build Inventory Grid HTML
 * IMPORTANT: NOT async
 * ========================= */
Util.buildClassificationGrid = function (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  let grid = '<ul id="inv-display">'

  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </a>
        <div class="namePrice">
          <hr>
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>
    `
  })

  grid += "</ul>"
  return grid
}

/* =========================
 * ✅ Build Vehicle Detail HTML
 * Used in inventory/detail.ejs as: <%- vehicleHtml %>
 * ========================= */
Util.buildVehicleHTML = function (vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle details not found.</p>'
  }

  const price = new Intl.NumberFormat("en-US").format(vehicle.inv_price)
  const miles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
    <section class="vehicle-detail">
      <div class="vehicle-detail__image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>

      <div class="vehicle-detail__info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> $${price}</p>
        <p><strong>Miles:</strong> ${miles}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `
}

/* =========================
 * ✅ GLOBAL JWT LOCALS
 * Sets: res.locals.loggedin + res.locals.accountData
 * ========================= */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies?.jwt

  if (process.env.NODE_ENV !== "production") {
    console.log("JWT check:", req.path, token ? "cookie exists" : "no cookie")
  }

  if (!token) {
    res.locals.loggedin = false
    res.locals.accountData = null
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      res.clearCookie("jwt")
      res.locals.loggedin = false
      res.locals.accountData = null
      return next()
    }

    res.locals.loggedin = true
    res.locals.accountData = accountData
    return next()
  })
}

/* =========================
 * ✅ Must be logged in
 * ========================= */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) return next()
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
}

/* =========================
 * ✅ Employee/Admin only
 * ========================= */
Util.checkAdminEmployee = (req, res, next) => {
  const acct = res.locals.accountData
  if (acct && (acct.account_type === "Employee" || acct.account_type === "Admin")) {
    return next()
  }
  req.flash("notice", "You must be logged in as an Employee or Admin.")
  return res.redirect("/account/login")
}

module.exports = Util

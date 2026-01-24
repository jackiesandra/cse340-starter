// ==============================================
// 🧰 Utilities
// Archivo: utilities/index.js
// ==============================================

const invModel = require("../models/inventory-model")

const Util = {}

/* **************************************
 * Helper: formato de precio
 * ************************************** */
Util.formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return "N/A"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
}

/* **************************************
 * Helper: formato de número
 * ************************************** */
Util.formatNumber = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return "N/A"
  return new Intl.NumberFormat("en-US").format(num)
}

/* **************************************
 * Build Navigation HTML
 * ************************************** */
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

/* **************************************
 * Build Classification Grid (lista)
 * ************************************** */
Util.buildClassificationGrid = function (data) {
  if (!data || data.length === 0) {
    return "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    const name = `${vehicle.inv_make} ${vehicle.inv_model}`

    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${name} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${name}">
        </a>
        <div class="namePrice">
          <hr>
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${name} details">
              ${name}
            </a>
          </h2>
          <span>${Util.formatPrice(vehicle.inv_price)}</span>
        </div>
      </li>
    `
  })
  grid += "</ul>"

  return grid
}

/* **************************************
 * Build Vehicle Detail HTML (1 carro)
 * ************************************** */
Util.buildVehicleHTML = function (vehicle) {
  const name = `${vehicle.inv_make} ${vehicle.inv_model}`

  // Defaults por si algo viene null
  const year = vehicle.inv_year ?? "N/A"
  const miles = vehicle.inv_miles ?? null
  const color = vehicle.inv_color ?? "N/A"

  return `
    <section class="inv-detail">
      <div class="inv-detail__media">
        <img src="${vehicle.inv_image}" alt="Image of ${name}">
      </div>

      <div class="inv-detail__content">
        <h2>${name}</h2>

        <p><strong>Price:</strong> ${Util.formatPrice(vehicle.inv_price)}</p>
        <p><strong>Year:</strong> ${year}</p>
        <p><strong>Mileage:</strong> ${miles === null ? "N/A" : Util.formatNumber(miles) + " miles"}</p>
        <p><strong>Color:</strong> ${color}</p>

        <h3>Description</h3>
        <p>${vehicle.inv_description}</p>
      </div>
    </section>
  `
}

/* **************************************
 * Handle Errors wrapper (async)
 * ************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

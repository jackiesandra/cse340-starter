const invModel = require("../models/inventory-model")

const Util = {}

Util.formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price)))
    return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

Util.formatNumber = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num)))
    return "N/A"
  return new Intl.NumberFormat("en-US").format(num)
}

Util.normalizePath = (p) => {
  if (!p) return ""
  return p.startsWith("/") ? p : `/${p}`
}

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

/* ***************************
 * ✅ Build Classification Select List (Task 3)
 * ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()

  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      Number(row.classification_id) === Number(classification_id)
    ) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

Util.buildClassificationGrid = function (data) {
  if (!data || data.length === 0) {
    return "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
  }

  let grid = '<ul id="inv-display">'

  data.forEach((vehicle) => {
    const name = `${vehicle.inv_make} ${vehicle.inv_model}`
    const id = Number(vehicle.inv_id)

    const detailLink = Number.isInteger(id) && id > 0 ? `/inv/detail/${id}` : "#"
    const thumb = Util.normalizePath(vehicle.inv_thumbnail)

    grid += `
      <li>
        <a href="${detailLink}" title="View ${name} details">
          <img src="${thumb}" alt="Image of ${name}">
        </a>
        <div class="namePrice">
          <hr>
          <h2>
            <a href="${detailLink}" title="View ${name} details">
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

Util.buildVehicleHTML = function (vehicle) {
  const name = `${vehicle.inv_make} ${vehicle.inv_model}`
  const year = vehicle.inv_year ?? "N/A"
  const miles = vehicle.inv_miles ?? null
  const color = vehicle.inv_color ?? "N/A"
  const image = Util.normalizePath(vehicle.inv_image)

  return `
    <section class="vehicle-detail">
      <div class="vehicle-detail__image">
        <img src="${image}" alt="Image of ${name}">
      </div>

      <div class="vehicle-detail__content">
        <h2>${name}</h2>

        <p class="vehicle-detail__price">${Util.formatPrice(vehicle.inv_price)}</p>
        <div class="vehicle-detail__meta">
          <p><strong>Year:</strong> ${year}</p>
          <p><strong>Mileage:</strong> ${
            miles === null ? "N/A" : Util.formatNumber(miles) + " miles"
          }</p>
          <p><strong>Color:</strong> ${color}</p>
        </div>

        <h3>Description</h3>
        <p>${vehicle.inv_description ?? ""}</p>
      </div>
    </section>
  `
}

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

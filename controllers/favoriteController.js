const utilities = require("../utilities")
const favoriteModel = require("../models/favorite-model")

async function index(req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  const favorites = await favoriteModel.getFavoritesByAccountId(accountData.account_id)

  res.render("favorites/index", {
    title: "My Favorites",
    nav,
    favorites,
  })
}

async function add(req, res) {
  const accountData = res.locals.accountData
  const inv_id = Number(req.params.inv_id)

  if (!Number.isInteger(inv_id) || inv_id <= 0) {
    req.flash("notice", "Invalid vehicle id.")
    return res.redirect("/inv/")
  }

  await favoriteModel.addFavorite(accountData.account_id, inv_id)
  req.flash("notice", "Added to favorites ✅")
  return res.redirect(`/inv/detail/${inv_id}`)
}

async function remove(req, res) {
  const accountData = res.locals.accountData
  const inv_id = Number(req.params.inv_id)

  if (!Number.isInteger(inv_id) || inv_id <= 0) {
    req.flash("notice", "Invalid vehicle id.")
    return res.redirect("/favorites")
  }

  await favoriteModel.removeFavorite(accountData.account_id, inv_id)
  req.flash("notice", "Removed from favorites.")
  return res.redirect(`/inv/detail/${inv_id}`)
}

module.exports = {
  index: utilities.handleErrors(index),
  add: utilities.handleErrors(add),
  remove: utilities.handleErrors(remove),
}

const reviewModel = require("../models/review-model")

const reviewController = {}

/* **************************************
 * Add Review (POST)
 * Route: /review/add/:inv_id
 * ************************************** */
reviewController.addReview = async function (req, res) {
  try {
    const inv_id = Number(req.params.inv_id)

    if (!inv_id || inv_id <= 0) {
      req.flash("notice", "Invalid vehicle.")
      return res.redirect("/")
    }

    // JWT ya seteó accountData en res.locals
    const accountData = res.locals.accountData

    if (!accountData) {
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    }

    const account_id = accountData.account_id

    const { rating, review_title, review_text } = req.body

    const ratingInt = Number(rating)

    // =============================
    // ✅ Validaciones
    // =============================
    if (
      !ratingInt ||
      ratingInt < 1 ||
      ratingInt > 5 ||
      !review_text ||
      review_text.trim().length < 10
    ) {
      req.flash(
        "notice",
        "Review must have a rating between 1 and 5 and at least 10 characters."
      )
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    // =============================
    // ✅ Guardar en DB
    // =============================
    const result = await reviewModel.addReview(
      inv_id,
      account_id,
      ratingInt,
      review_title ? review_title.trim() : null,
      review_text.trim()
    )

    if (result?.error) {
      req.flash(
        "notice",
        "You may have already submitted a review for this vehicle."
      )
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    req.flash("notice", "Review added successfully.")
    return res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    console.error("Review Error:", error)
    req.flash("notice", "Something went wrong. Please try again.")
    return res.redirect(`/inv/detail/${req.params.inv_id}`)
  }
}

module.exports = reviewController

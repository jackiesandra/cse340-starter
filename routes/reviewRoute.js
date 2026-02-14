const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")

router.post(
  "/add/:inv_id",
  utilities.checkLogin,
  reviewController.addReview
)

module.exports = router

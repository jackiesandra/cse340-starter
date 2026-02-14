const express = require("express")
const router = new express.Router()
const favoriteController = require("../controllers/favoriteController")
const utilities = require("../utilities")

// Lista de favoritos
router.get("/", utilities.checkLogin, favoriteController.index)

// Agregar / quitar favorito
router.post("/add/:inv_id", utilities.checkLogin, favoriteController.add)
router.post("/remove/:inv_id", utilities.checkLogin, favoriteController.remove)

module.exports = router

const pool = require("../database")

async function getClassifications() {
  const sql = "SELECT * FROM public.classification ORDER BY classification_name"
  const result = await pool.query(sql)
  return result.rows
}

async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT 
      i.inv_id,
      i.inv_make,
      i.inv_model,
      i.inv_description,
      i.inv_image,
      i.inv_thumbnail,
      i.inv_price,
      i.inv_year,
      i.inv_miles,
      i.inv_color,
      c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make, i.inv_model;
  `
  const result = await pool.query(sql, [classification_id])
  return result.rows
}

async function getVehicleById(inv_id) {
  const sql = `
    SELECT 
      i.inv_id,
      i.inv_make,
      i.inv_model,
      i.inv_description,
      i.inv_image,
      i.inv_thumbnail,
      i.inv_price,
      i.inv_year,
      i.inv_miles,
      i.inv_color,
      c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1;
  `
  const result = await pool.query(sql, [inv_id])
  return result.rows[0] || null
}

/* ***************************
 * Task 2: Add Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* ***************************
 * Task 3: Add Inventory
 * ************************** */
async function addInventory(data) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `
    const params = [
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
    ]
    const result = await pool.query(sql, params)
    return result.rows[0]
  } catch (error) {
    return null
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
}

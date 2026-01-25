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

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
}

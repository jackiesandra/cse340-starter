const pool = require("../database")

async function addFavorite(account_id, inv_id) {
  const sql = `
    INSERT INTO favorites (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT (account_id, inv_id) DO NOTHING
    RETURNING favorite_id;
  `
  const data = await pool.query(sql, [account_id, inv_id])
  return data.rows[0] || null
}

async function removeFavorite(account_id, inv_id) {
  const sql = `
    DELETE FROM favorites
    WHERE account_id = $1 AND inv_id = $2
    RETURNING favorite_id;
  `
  const data = await pool.query(sql, [account_id, inv_id])
  return data.rows[0] || null
}

async function getFavoritesByAccountId(account_id) {
  const sql = `
    SELECT
      f.favorite_id,
      f.created_at,
      i.inv_id,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_price,
      i.inv_thumbnail,
      c.classification_name
    FROM favorites f
    JOIN inventory i ON i.inv_id = f.inv_id
    JOIN classification c ON c.classification_id = i.classification_id
    WHERE f.account_id = $1
    ORDER BY f.created_at DESC;
  `
  const data = await pool.query(sql, [account_id])
  return data.rows
}

async function isFavorite(account_id, inv_id) {
  const sql = `
    SELECT 1
    FROM favorites
    WHERE account_id = $1 AND inv_id = $2
    LIMIT 1;
  `
  const data = await pool.query(sql, [account_id, inv_id])
  return data.rowCount > 0
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId,
  isFavorite,
}

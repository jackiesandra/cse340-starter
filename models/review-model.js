const pool = require("../database/")

async function addReview(inv_id, account_id, rating, review_title, review_text) {
  try {
    const sql = `
      INSERT INTO review 
      (inv_id, account_id, rating, review_title, review_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING review_id
    `
    const data = await pool.query(sql, [
      inv_id,
      account_id,
      rating,
      review_title,
      review_text
    ])
    return data.rows[0]
  } catch (error) {
    return { error: error.message }
  }
}

async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.review_id, r.rating, r.review_title, r.review_text,
             r.created_at,
             a.account_firstname,
             a.account_lastname
      FROM review r
      JOIN account a
        ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    return []
  }
}

async function getReviewSummary(inv_id) {
  try {
    const sql = `
      SELECT
        COUNT(*)::int AS count,
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg
      FROM review
      WHERE inv_id = $1
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    return { count: 0, avg: 0 }
  }
}

module.exports = {
  addReview,
  getReviewsByInvId,
  getReviewSummary
}

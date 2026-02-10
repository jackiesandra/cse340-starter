const pool = require("../database")

async function registerAccount(first_name, last_name, email, hashedPassword) {
  const sql = `
    INSERT INTO account (first_name, last_name, email, password, account_type)
    VALUES ($1, $2, $3, $4, 'Client')
    RETURNING *
  `
  const result = await pool.query(sql, [first_name, last_name, email, hashedPassword])
  return result.rows[0]
}

async function checkExistingEmail(email) {
  const sql = `SELECT * FROM account WHERE email = $1`
  const result = await pool.query(sql, [email])
  return result.rowCount > 0
}

async function getAccountByEmail(email) {
  const sql = `SELECT * FROM account WHERE email = $1`
  const result = await pool.query(sql, [email])
  return result.rows[0]
}

async function getAccountById(account_id) {
  const sql = `SELECT * FROM account WHERE account_id = $1`
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

async function updateAccountInfo(account_id, first_name, last_name, email) {
  const sql = `
    UPDATE account
    SET first_name = $1,
        last_name = $2,
        email = $3
    WHERE account_id = $4
    RETURNING *
  `
  const result = await pool.query(sql, [first_name, last_name, email, account_id])
  return result.rows[0]
}

async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE account
    SET password = $1
    WHERE account_id = $2
  `
  const result = await pool.query(sql, [hashedPassword, account_id])
  return result.rowCount === 1
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
}

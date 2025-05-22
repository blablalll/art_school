// models/client.js
const pool = require('../config/db');

module.exports = {
  findAll: async ({ page, limit, sort, order, search }) => {
    const offset = (page - 1) * limit;
    const validSortFields = ['id', 'full_name', 'registration_date'];
    const sortField = validSortFields.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const query = {
      text: `
        SELECT id, full_name AS "fullName", phone, email, 
               TO_CHAR(registration_date, 'YYYY-MM-DD') AS "registrationDate"
        FROM clients
        WHERE $1::text IS NULL OR full_name ILIKE $1
        ORDER BY ${sortField} ${sortOrder}
        LIMIT $2 OFFSET $3
      `,
      values: [`%${search}%`, limit, offset]
    };

    const countQuery = {
      text: 'SELECT COUNT(*) FROM clients WHERE $1::text IS NULL OR full_name ILIKE $1',
      values: [`%${search}%`]
    };

    const [data, count] = await Promise.all([
      pool.query(query),
      pool.query(countQuery)
    ]);

    return {
      data: data.rows,
      totalPages: Math.ceil(parseInt(count.rows[0].count, 10) / limit),
      currentPage: page
    };
  },

findById: async (id) => {
  const { rows } = await pool.query(
    `SELECT id, 
      full_name AS "fullName", 
      phone, 
      email, 
      TO_CHAR(registration_date, 'YYYY-MM-DD') AS "registrationDate" 
     FROM clients WHERE id = $1`,
    [id]
  );
  return rows[0];
},
  create: async ({ fullName, phone, email }) => {
    const { rows } = await pool.query(
      'INSERT INTO clients (full_name, phone, email) VALUES ($1, $2, $3) RETURNING *',
      [fullName, phone, email]
    );
    return rows[0];
  },

update: async (id, { fullName, phone, email }) => {
  const { rows } = await pool.query(
    `UPDATE clients SET
      full_name = COALESCE($1, full_name),
      phone = COALESCE($2, phone),
      email = COALESCE($3, email)
     WHERE id = $4
     RETURNING 
       id,
       full_name AS "fullName",
       phone,
       email,
       TO_CHAR(registration_date, 'YYYY-MM-DD') AS "registrationDate"`,
    [fullName, phone, email, id]
  );
  return rows[0];
},

  delete: async (id) => {
    const { rowCount } = await pool.query(
      'DELETE FROM clients WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query(
      'SELECT * FROM clients WHERE email = $1',
      [email]
    );
    return rows;
  }
};
// models/teachers.js
const pool = require('../config/db');

module.exports = {
  // Получение списка преподавателей с пагинацией и фильтрацией
  findAll: async ({
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
    sectionId = null
  }) => {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;
      const validSortFields = {
        id: 't.id',
        fullName: 't.full_name'
      };
      const sortField = validSortFields[sort] || 't.id';
      const sortOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

      const query = {
        text: `
          WITH teachers_data AS (
            SELECT 
              t.id,
              t.full_name AS "fullName",
              t.phone,
              t.email,
              ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS "sectionNames",
              ARRAY_AGG(s.id) FILTER (WHERE s.id IS NOT NULL) AS "sectionIds",
              COUNT(*) OVER() AS total_count
            FROM teachers t
            LEFT JOIN teacher_sections ts ON t.id = ts.teacher_id
            LEFT JOIN sections s ON ts.section_id = s.id
            WHERE
              ($1::text IS NULL OR t.full_name ILIKE $1) AND
              ($2::int IS NULL OR s.id = $2)
            GROUP BY t.id, t.full_name, t.phone, t.email
            ORDER BY ${sortField} ${sortOrder}
            LIMIT $3 OFFSET $4
          )
          SELECT * FROM teachers_data
        `,
        values: [`%${search}%`, sectionId, limit, offset]
      };

      const { rows } = await client.query(query);

      if (rows.length === 0) {
        return {
          data: [],
          total: 0,
          totalPages: 1,
          currentPage: page
        };
      }

      const total = parseInt(rows[0].total_count, 10);
      const totalPages = Math.ceil(total / limit);

      return {
        data: rows,
        total,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      throw new Error(`Ошибка получения списка преподавателей: ${error.message}`);
    } finally {
      client.release();
    }
  },

  // Получение преподавателя по ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query(
        `SELECT 
          t.id,
          t.full_name AS "fullName",
          t.phone,
          t.email,
          ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS "sectionNames",
          ARRAY_AGG(s.id) FILTER (WHERE s.id IS NOT NULL) AS "sectionIds"
        FROM teachers t
        LEFT JOIN teacher_sections ts ON t.id = ts.teacher_id
        LEFT JOIN sections s ON ts.section_id = s.id
        WHERE t.id = $1
        GROUP BY t.id, t.full_name, t.phone, t.email`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Ошибка поиска преподавателя: ${error.message}`);
    }
  },

  // Создание нового преподавателя
  create: async ({ fullName, phone, email, sectionIds = [] }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Проверка существования секций
      if (sectionIds.length > 0) {
        const sectionCheck = await client.query(
          `SELECT id FROM sections WHERE id = ANY($1)`,
          [sectionIds]
        );
        if (sectionCheck.rows.length !== sectionIds.length) {
          throw new Error('Одна или несколько секций не существуют');
        }
      }

      // Добавление преподавателя
      const teacherQuery = `
        INSERT INTO teachers (full_name, phone, email)
        VALUES ($1, $2, $3)
        RETURNING id, full_name AS "fullName", phone, email
      `;
      const teacherRes = await client.query(teacherQuery, [fullName, phone, email]);
      const teacher = teacherRes.rows[0];

      // Добавление связей с секциями
      if (sectionIds.length > 0) {
        const values = sectionIds.map((id, i) => `($1, $${i + 2})`).join(',');
        await client.query(
          `INSERT INTO teacher_sections (teacher_id, section_id) VALUES ${values}`,
          [teacher.id, ...sectionIds]
        );
      }

      await client.query('COMMIT');
      return teacher;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Ошибка создания преподавателя: ${error.message}`);
    } finally {
      client.release();
    }
  },

  // Обновление данных преподавателя
  update: async (id, { fullName, phone, email, sectionIds = [] }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Проверка существования преподавателя
      const teacherCheck = await client.query(
        `SELECT id FROM teachers WHERE id = $1`,
        [id]
      );
      if (!teacherCheck.rows[0]) {
        throw new Error('Преподаватель не найден');
      }

      // Обновление данных преподавателя
      const updateQuery = `
        UPDATE teachers SET
          full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email)
        WHERE id = $4
        RETURNING id, full_name AS "fullName", phone, email
      `;
      const updateRes = await client.query(updateQuery, [fullName, phone, email, id]);
      const updatedTeacher = updateRes.rows[0];

      // Обновление связей с секциями
      await client.query('DELETE FROM teacher_sections WHERE teacher_id = $1', [id]);

      if (sectionIds.length > 0) {
        const values = sectionIds.map((id, i) => `($1, $${i + 2})`).join(',');
        await client.query(
          `INSERT INTO teacher_sections (teacher_id, section_id) VALUES ${values}`,
          [updatedTeacher.id, ...sectionIds]
        );
      }

      await client.query('COMMIT');
      return updatedTeacher;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Ошибка обновления преподавателя: ${error.message}`);
    } finally {
      client.release();
    }
  },

  // Удаление преподавателя
  delete: async (id) => {
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM teachers WHERE id = $1',
        [id]
      );
      return rowCount > 0;
    } catch (error) {
      throw new Error(`Ошибка удаления преподавателя: ${error.message}`);
    }
  }
};
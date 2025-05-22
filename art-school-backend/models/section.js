// models/section.js
const pool = require('../config/db');

/**
 * Модель Section — работа с таблицей секций
 */
const Section = {
  /**
   * Получить список всех секций с поддержкой пагинации, сортировки и поиска
   */
  findAll: async ({ page = 1, limit = 10, sort = 'id', order = 'asc', search = '', id = null }) => {
  const offset = (page - 1) * limit;
  const validSortFields = ['id', 'name', 'max_participants'];
  const sortField = validSortFields.includes(sort) ? sort : 'id';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT id, name, description, max_participants AS "maxParticipants"
    FROM sections
    WHERE true`;

  const params = [];

  // Проверяем, что id — число
  if (id !== null && !isNaN(parseInt(id))) {
    query += ` AND id = $${params.length + 1}`;
    params.push(id);
  } else if (id !== null) {
    throw new Error("ID должен быть числом");
  }

  if (search) {
    query += ` AND name ILIKE $${params.length + 1}`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY ${sortField} ${sortOrder}`;
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  // COUNT запрос
  let countQuery = `SELECT COUNT(*) FROM sections WHERE true`;
  let countParams = [];

  if (id !== null && !isNaN(parseInt(id))) {
    countQuery += ` AND id = $1`;
    countParams.push(id);
  }

  if (search) {
    countQuery += id !== null ? ` AND name ILIKE $2` : ` AND name ILIKE $1`;
    countParams.push(`%${search}%`);
  }

  try {
    const [dataRes, countRes] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataRes.rows,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    throw new Error(`Ошибка при выборке секций: ${error.message}`);
  }
},

  /**
   * Найти секцию по ID
   */
  findById: async (id) => {
    const query = `
      SELECT id, name, description, max_participants AS "maxParticipants"
      FROM sections
      WHERE id = $1`;
    try {
      const result = await pool.query(query, [id]);
      const section = result.rows[0];
      return section ? {
        id: section.id,
        name: section.name,
        description: section.description,
        maxParticipants: section.max_participants
      } : null;
    } catch (error) {
      throw new Error(`Ошибка при поиске секции по ID: ${error.message}`);
    }
  },

  /**
   * Создать новую секцию
   */
  create: async ({ name, description, maxParticipants }) => {
    const query = `
      INSERT INTO sections(name, description, max_participants)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, max_participants AS "maxParticipants"`;
    try {
      const result = await pool.query(query, [
        name,
        description,
        parseInt(maxParticipants)
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error in create:', error);
      throw error;
    }
  },

  /**
   * Обновить существующую секцию
   */
  update: async (id, { name, description, maxParticipants }) => {
    // Проверяем, что обязательные поля заполнены
    if (!name || !maxParticipants || maxParticipants < 1) {
      throw new Error('Название и максимальное количество участников обязательны');
    }

    // Проверяем уникальность имени
    const nameExists = await Section.checkNameExists(name, id);
    if (nameExists) {
      throw new Error('Секция с таким названием уже существует');
    }

    const query = `
      UPDATE sections
      SET name = $1, description = $2, max_participants = $3
      WHERE id = $4
      RETURNING id, name, description, max_participants AS "maxParticipants"`;

    try {
      const result = await pool.query(query, [
        name,
        description,
        parseInt(maxParticipants),
        id
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Ошибка при обновлении секции:', error);
      throw error;
    }
  },

  /**
   * Удалить секцию по ID
   */
  delete: async (id) => {
    const query = `
      DELETE FROM sections
      WHERE id = $1
      RETURNING id`;
    try {
      const result = await pool.query(query, [id]);
      return !!result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка при удалении секции: ${error.message}`);
    }
  },

  /**
   * Проверка уникальности названия секции
   */
  checkNameExists: async (name, excludeId = null) => {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM sections 
        WHERE name = $1 
        ${excludeId ? 'AND id != $2' : ''}
      )`;
    const params = excludeId ? [name, excludeId] : [name];

    try {
      const result = await pool.query(query, params);
      return result.rows[0].exists;
    } catch (error) {
      console.error('Ошибка при проверке имени секции:', error);
      throw new Error('Ошибка при проверке уникальности имени секции');
    }
  }
};

module.exports = Section;
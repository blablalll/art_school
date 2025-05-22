const pool = require('../config/db');

/**
 * === Модель Abonim — работа с таблицей абонементов ===
 */
const Abonim = {
  /**
   * Получить все абонементы с пагинацией, фильтрацией и сортировкой
   */
  findAll: async ({ 
    page = 1, 
    limit = 10, 
    sort = 'startDate', 
    order = 'asc', 
    status,
    clientId,
    startDate // Можно использовать как точную дату или "от"
  }) => {
    const offset = (page - 1) * limit;

    // Маппинг полей сортировки
    const sortMap = {
      id: 'a.id',
      client_full_name: 'c.full_name',
      startDate: 'a.start_date',
      endDate: 'a.end_date',
      visited_count: 'visited.count',
      status: 'status'
    };
    const dbSortField = sortMap[sort] || 'a.start_date';

    // Параметры фильтрации
    const filterConditions = [];
    const filterParams = [];

    // Фильтр по статусу
    if (status) {
      filterConditions.push(`
        CASE
          WHEN a.end_date < CURRENT_DATE THEN 'Просрочен'
          WHEN COALESCE(visited.count, 0) >= a.visit_count THEN 'Использован'
          ELSE 'Активен'
        END = $${filterParams.length + 1}
      `);
      filterParams.push(status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());
    }

    // Фильтр по клиенту
    if (clientId) {
      filterConditions.push(`a.client_id = $${filterParams.length + 1}`);
      filterParams.push(clientId);
    }

    // Фильтр по дате начала (точная дата)
    if (startDate) {
      filterConditions.push(`a.start_date = $${filterParams.length + 1}`);
      filterParams.push(startDate);
    }

    // Объединяем условия фильтрации
    const whereClause = filterConditions.length > 0 
      ? `WHERE ${filterConditions.join(' AND ')}` 
      : '';

    // Основной запрос
    const baseQuery = `
      SELECT 
        a.id,
        a.client_id,
        c.full_name AS client_full_name,
        a.start_date,
        a.end_date,
        a.visit_count,
        COALESCE(visited.count, 0) AS visited_count,
        CASE
          WHEN a.end_date < CURRENT_DATE THEN 'Просрочен'
          WHEN COALESCE(visited.count, 0) >= a.visit_count THEN 'Использован'
          ELSE 'Активен'
        END AS status
      FROM abonims a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN (
        SELECT abonim_id, COUNT(*) AS count
        FROM records
        WHERE abonim_id IS NOT NULL
        GROUP BY abonim_id
      ) visited ON a.id = visited.abonim_id
      ${whereClause}
    `;

    // Запрос для подсчёта записей
    const countQuery = `
      SELECT COUNT(*) FROM (${baseQuery}) AS filtered
    `;

    // Запрос данных с сортировкой
    const dataQuery = `
      ${baseQuery}
      ORDER BY ${dbSortField} ${order}
      LIMIT $${filterParams.length + 1} 
      OFFSET $${filterParams.length + 2}
    `;

    // Параметры для запроса данных
    const params = [
      ...filterParams,
      limit,
      offset
    ];

    try {
      const [dataRes, countRes] = await Promise.all([
        pool.query(dataQuery, params),
        pool.query(countQuery, filterParams)
      ]);

      return {
        data: dataRes.rows,
        total: parseInt(countRes.rows[0].count, 10),
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(parseInt(countRes.rows[0].count, 10) / limit)
      };
    } catch (error) {
      console.error('Ошибка при получении абонементов:', error.message);
      throw new Error(`Ошибка базы данных: ${error.message}`);
    }
  },

  /**
   * Добавить новый абонемент
   */
  create: async ({ clientId, startDate, visitCount }) => {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const query = `
      INSERT INTO abonims (client_id, start_date, end_date, visit_count)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      clientId,
      startDate,
      endDate.toISOString().split('T')[0],
      visitCount
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при добавлении абонемента:', error.message);
      throw new Error(`Не удалось создать абонемент: ${error.message}`);
    }
  },

  /**
   * Обновить абонемент
   */
  update: async (id, { clientId, startDate, visitCount }) => {
    const updates = [];
    const values = [];
    let queryIndex = 1;

    if (clientId !== undefined && clientId !== null) {
      updates.push(`client_id = $${queryIndex++}`);
      values.push(clientId);
    }

    if (startDate !== undefined && startDate !== null) {
      updates.push(
        `start_date = $${queryIndex++}`,
        `end_date = $${queryIndex++}::date + INTERVAL '1 month'`
      );
      values.push(startDate, startDate);
    }

    if (visitCount !== undefined && visitCount !== null) {
      updates.push(`visit_count = $${queryIndex++}`);
      values.push(visitCount);
    }

    if (updates.length === 0) {
      throw new Error('Нет данных для обновления');
    }

    const query = `
      UPDATE abonims
      SET ${updates.join(', ')}
      WHERE id = $${queryIndex}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при обновлении абонемента:', error.message);
      throw new Error(`Не удалось обновить абонемент: ${error.message}`);
    }
  },

  /**
   * Удалить абонемент
   */
  delete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Сначала удаляем записи в records
      await client.query('DELETE FROM records WHERE abonim_id = $1', [id]);

      // Затем удаляем сам абонемент
      const result = await client.query('DELETE FROM abonims WHERE id = $1 RETURNING *', [id]);

      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Ошибка при удалении абонемента:', error.message);
      throw new Error(`Не удалось удалить абонемент: ${error.message}`);
    } finally {
      client.release();
    }
  },

  /**
   * Найти абонемент по ID
   */
  findById: async (id) => {
    const query = `
      SELECT 
        a.id,
        a.client_id,
        c.full_name AS client_full_name,
        a.start_date,
        a.end_date,
        a.visit_count,
        COALESCE(visited.count, 0) AS visited_count,
        CASE
          WHEN a.end_date < CURRENT_DATE THEN 'Просрочен'
          WHEN COALESCE(visited.count, 0) >= a.visit_count THEN 'Использован'
          ELSE 'Активен'
        END AS status
      FROM abonims a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN (
        SELECT abonim_id, COUNT(*) AS count
        FROM records
        WHERE abonim_id IS NOT NULL
        GROUP BY abonim_id
      ) visited ON a.id = visited.abonim_id
      WHERE a.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Ошибка при поиске абонемента:', error.message);
      throw new Error(`Ошибка базы данных: ${error.message}`);
    }
  }
};

module.exports = Abonim;
// controllers/records.js
const pool = require('../config/db');
const { format } = require('date-fns');

/**
 * Контроллер для работы с записями клиентов на занятия
 */
exports.getAllRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Параметры сортировки
    const sortField = req.query.sortField || 's.id';
    const sortDirection = req.query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    // Фильтры
    const clientFilter = req.query.client?.trim();
    const sectionFilter = req.query.section?.trim();
    const dateFilter = req.query.date?.trim();

    // Базовый SQL-запрос
    let baseQuery = `
      SELECT 
        r.id,
        r.schedule_id AS "scheduleId",
        c.full_name AS "clientName",
        s.date,
        s.start_time AS "startTime",
        s.duration,
        t.full_name AS "teacherName",
        sec.name AS "sectionName"
      FROM records r
      JOIN clients c ON r.client_id = c.id
      JOIN schedule s ON r.schedule_id = s.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE TRUE`;

    const params = [];

    // Фильтрация по имени клиента
    if (clientFilter) {
      baseQuery += ` AND c.full_name ILIKE $${params.length + 1}`;
      params.push(`%${clientFilter}%`);
    }

    // Фильтрация по названию секции
    if (sectionFilter) {
      baseQuery += ` AND sec.name ILIKE $${params.length + 1}`;
      params.push(`%${sectionFilter}%`);
    }

    // Фильтрация по дате (игнорирование часового пояса)
   if (dateFilter) {
  baseQuery += ` AND s.date::date = $${params.length + 1}::date`;
  params.push(dateFilter);
}

    // Сортировка
    const validSortFields = {
      id: 'r.id',
      date: 's.date',
      teacherName: 't.full_name',
      sectionName: 'sec.name',
      clientName: 'c.full_name'
    };

    const dbField = validSortFields[sortField] || 'r.id';
    const direction = sortDirection === 'DESC' ? 'DESC' : 'ASC';
    const orderBy = `${dbField} ${direction}`;

    const finalQuery = `${baseQuery} ORDER BY ${orderBy}`;

    // Запрос на подсчёт общего количества записей
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS filtered_records`;

    // Добавляем пагинацию
    const paginatedQuery = `${finalQuery} LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    // Выполняем оба запроса параллельно
    const [dataResult, countResult] = await Promise.all([
      pool.query(paginatedQuery, params),
      pool.query(countQuery, params.slice(0, -2)) // без LIMIT/OFFSET
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // Ответ клиенту
    res.json({
      success: true,
      data: dataResult.rows,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(new Error(`Ошибка получения записей: ${error.message}`));
  }
};

/**
 * Получить записи клиента по ID занятия
 */
exports.getRecordById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const query = `
      SELECT 
        r.id,
        r.schedule_id AS "scheduleId",
        r.client_id AS "clientId",
        c.full_name AS "clientName",
        s.date,
        s.start_time AS "startTime",
        s.duration,
        t.full_name AS "teacherName",
        sec.name AS "sectionName"
      FROM records r
      JOIN clients c ON r.client_id = c.id
      JOIN schedule s ON r.schedule_id = s.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Запись не найдена' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new Error(`Ошибка получения записи: ${error.message}`));
  }
};

/**
 * Добавить новую запись
 */
exports.createRecord = async (req, res, next) => {
  const client_id = parseInt(req.body.clientId);
  const schedule_id = parseInt(req.body.scheduleId);

  if (!client_id || !schedule_id) {
    return res.status(400).json({ success: false, message: 'Не хватает обязательных полей' });
  }

  try {
    // Поиск подходящего активного абонемента у клиента
    const clientAbonim = await pool.query(
      `SELECT * FROM abonims 
       WHERE client_id = $1 
         AND end_date >= CURRENT_DATE 
         AND visit_count > visited_count 
       ORDER BY start_date DESC LIMIT 1`,
      [client_id]
    );

    if (!clientAbonim.rows.length) {
      return res.status(400).json({ success: false, message: 'Нет подходящего абонемента' });
    }

    const abonim = clientAbonim.rows[0];

    // Проверяем расписание
    const scheduleCheck = await pool.query('SELECT id FROM schedule WHERE id = $1', [schedule_id]);
    if (!scheduleCheck.rows.length) {
      return res.status(404).json({ success: false, message: 'Занятие не найдено' });
    }

    // Проверка дублирования записи
    const existingRecord = await pool.query(
      'SELECT * FROM records WHERE client_id = $1 AND schedule_id = $2',
      [client_id, schedule_id]
    );
    if (existingRecord.rows.length) {
      return res.status(400).json({ success: false, message: 'Клиент уже записан на это занятие' });
    }

    // Проверка вместимости секции
    const maxParticipantsRes = await pool.query(`
      SELECT sec.max_participants
      FROM schedule s JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = $1`, [schedule_id]);

    const maxParticipants = maxParticipantsRes.rows[0]?.max_participants || 0;

    const currentCountRes = await pool.query(
      'SELECT COUNT(*) FROM records WHERE schedule_id = $1', [schedule_id]
    );
    const currentCount = parseInt(currentCountRes.rows[0].count, 10);

    if (currentCount >= maxParticipants) {
      return res.status(400).json({ success: false, message: 'Превышено максимальное количество участников' });
    }

    // === Добавляем запись с указанием abonim_id ===
    const insertQuery = `
      INSERT INTO records (client_id, schedule_id, abonim_id)
      VALUES ($1, $2, $3)
      RETURNING id, client_id AS "clientId", schedule_id AS "scheduleId"`;

    const result = await pool.query(insertQuery, [client_id, schedule_id, abonim.id]);

    // Увеличиваем счётчик посещений в абонементе
    const updatedVisitedCount = abonim.visited_count + 1;
    await pool.query(
      'UPDATE abonims SET visited_count = $1 WHERE id = $2',
      [updatedVisitedCount, abonim.id]
    );

    // Обновляем статус расписания
    const newStatus = currentCount + 1 >= maxParticipants ? 'busy' : 'free';
    await pool.query('UPDATE schedule SET status = $1 WHERE id = $2', [newStatus, schedule_id]);

    // Ответ клиенту
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Запись успешно создана',
      abonimUpdated: {
        visited_count: updatedVisitedCount,
        status: updatedVisitedCount >= abonim.visit_count ? 'Использован' : 'Активен'
      }
    });

  } catch (error) {
    console.error('Ошибка при создании записи:', error.message);
    next(new Error(`Ошибка создания записи: ${error.message}`));
  }
};

/**
 * Удалить запись
 */
exports.deleteRecord = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Получаем информацию о записи
    const recordRes = await pool.query(
      'SELECT * FROM records WHERE id = $1', [id]
    );

    if (!recordRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Запись не найдена' });
    }

    const record = recordRes.rows[0];
    const schedule_id = record.schedule_id;

    // Удаляем запись
    await pool.query('DELETE FROM records WHERE id = $1', [id]);

    // Обновляем статус расписания
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM records WHERE schedule_id = $1', [schedule_id]
    );
    const count = parseInt(countRes.rows[0].count, 10);

    const maxParticipantsRes = await pool.query(`
      SELECT sec.max_participants
      FROM schedule s
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = $1`, [schedule_id]);

    const maxParticipants = maxParticipantsRes.rows[0]?.max_participants || 0;

    const newStatus = count >= maxParticipants ? 'busy' : 'free';
    await pool.query('UPDATE schedule SET status = $1 WHERE id = $2', [newStatus, schedule_id]);

    res.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    next(new Error(`Ошибка удаления записи: ${error.message}`));
  }
};
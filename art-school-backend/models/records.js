// models/records.js
const pool = require('../config/db');

module.exports = {

  /**
   * Получить все записи с пагинацией
   */
  getAllRecords: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    try {
      const dataQuery = `
        SELECT 
          r.id,
          r.client_id AS "clientId",
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
        ORDER BY s.date DESC, s.start_time DESC
        LIMIT $1 OFFSET $2`;

      const countQuery = 'SELECT COUNT(*) FROM records';

      const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [limit, offset]),
        pool.query(countQuery)
      ]);

      return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        currentPage: page
      };
    } catch (error) {
      throw new Error(`Ошибка получения записей: ${error.message}`);
    }
  },

  /**
   * Создать новую запись
   */
  createRecord: async ({ clientId, scheduleId }) => {
    try {
      // Проверяем, существует ли занятие
      const scheduleCheck = await pool.query(
        'SELECT id, status FROM schedule WHERE id = $1', [scheduleId]
      );

      if (!scheduleCheck.rows.length) {
        throw new Error('Занятие не найдено');
      }

      const schedule = scheduleCheck.rows[0];

      // Проверяем максимальное количество участников
      const maxParticipantsRes = await pool.query(`
        SELECT sec.max_participants
        FROM schedule s
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.id = $1`, [scheduleId]);

      const maxParticipants = maxParticipantsRes.rows[0]?.max_participants || 0;

      // Считаем текущее количество записавшихся
      const currentCountRes = await pool.query(
        'SELECT COUNT(*) FROM records WHERE schedule_id = $1', [scheduleId]
      );
      const currentCount = parseInt(currentCountRes.rows[0].count, 10);

      if (currentCount >= maxParticipants) {
        throw new Error('Превышено максимальное количество участников');
      }

      // Проверяем, не записан ли клиент уже на это занятие
      const existingRecord = await pool.query(
        'SELECT * FROM records WHERE client_id = $1 AND schedule_id = $2',
        [clientId, scheduleId]
      );

      if (existingRecord.rows.length) {
        throw new Error('Клиент уже записан на это занятие');
      }

      // Добавляем запись
      const insertQuery = `
        INSERT INTO records(client_id, schedule_id)
        VALUES ($1, $2)
        RETURNING 
          id,
          client_id AS "clientId",
          schedule_id AS "scheduleId"`;

      const result = await pool.query(insertQuery, [clientId, scheduleId]);

      // Обновляем статус расписания
      const newStatus = currentCount + 1 >= maxParticipants ? 'busy' : 'free';
      await pool.query('UPDATE schedule SET status = $1 WHERE id = $2', [newStatus, scheduleId]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка создания записи: ${error.message}`);
    }
  },

  /**
   * Удалить запись по ID
   */
  deleteRecord: async (id) => {
    try {
      // Получаем данные о записи
      const recordRes = await pool.query(
        'SELECT * FROM records WHERE id = $1', [id]
      );

      if (!recordRes.rows.length) {
        throw new Error('Запись не найдена');
      }

      const record = recordRes.rows[0];
      const scheduleId = record.schedule_id;

      // Удаляем запись
      await pool.query('DELETE FROM records WHERE id = $1', [id]);

      // Обновляем статус расписания
      const countRes = await pool.query(
        'SELECT COUNT(*) FROM records WHERE schedule_id = $1', [scheduleId]
      );
      const count = parseInt(countRes.rows[0].count, 10);

      const maxParticipantsRes = await pool.query(`
        SELECT sec.max_participants
        FROM schedule s
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.id = $1`, [scheduleId]);

      const maxParticipants = maxParticipantsRes.rows[0]?.max_participants || 0;
      const newStatus = count >= maxParticipants ? 'busy' : 'free';

      await pool.query('UPDATE schedule SET status = $1 WHERE id = $2', [newStatus, scheduleId]);

      return true;
    } catch (error) {
      throw new Error(`Ошибка удаления записи: ${error.message}`);
    }
  },

  /**
   * Получить список клиентов по ID занятия
   */
  getClientsByScheduleId: async (scheduleId) => {
    try {
      const query = `
        SELECT 
          c.id,
          c.full_name AS "fullName",
          c.phone,
          c.email
        FROM records r
        JOIN clients c ON r.client_id = c.id
        WHERE r.schedule_id = $1`;

      const result = await pool.query(query, [scheduleId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Ошибка получения клиентов: ${error.message}`);
    }
  }
};
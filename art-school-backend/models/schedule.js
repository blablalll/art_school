// models/schedule.js
const pool = require('../config/db');
module.exports = {
  findAll: async ({ 
    page = 1, 
    limit = 10, 
    sort = 'id', 
    order = 'asc', 
    date, 
    teacherId, 
    sectionId, 
    status,
    search // Добавляем параметр поиска
  }) => {
    try {
      const offset = (page - 1) * limit;

      // Разрешённые поля для сортировки
      const validSortFields = ['s.id', 's.date', 's.start_time', 's.duration', 't.full_name', 'sec.name'];
      const sortField = validSortFields.includes(sort) ? sort : 's.id';
      const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      let whereClauses = [];
      let values = [];

      // Фильтр по дате
      if (date) {
        whereClauses.push(`s.date = $${values.length + 1}::DATE`);
        values.push(date);
      }

      // Фильтр по преподавателю
      if (teacherId) {
        whereClauses.push(`s.teacher_id = $${values.length + 1}::INTEGER`);
        values.push(teacherId);
      }

      // Фильтр по секции
      if (sectionId) {
        whereClauses.push(`s.section_id = $${values.length + 1}::INTEGER`);
        values.push(sectionId);
      }

      // Поиск по имени преподавателя или названию секции
      if (search && search.trim()) {
        whereClauses.push(`(t.full_name ILIKE $${values.length + 1} OR sec.name ILIKE $${values.length + 1})`);
        values.push(`%${search}%`);
      }

      // Фильтр по статусу (занято / свободно)
      if (status === 'busy') {
        whereClauses.push(`(SELECT COUNT(*) FROM records r WHERE r.schedule_id = s.id) >= sec.max_participants`);
      } else if (status === 'free') {
        whereClauses.push(`(SELECT COUNT(*) FROM records r WHERE r.schedule_id = s.id) < sec.max_participants`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Основной запрос на получение данных
      const dataQuery = {
        text: `
          SELECT 
            s.id,
            s.date,
            s.start_time AS "startTime",
            s.duration,
            s.status,
            s.section_id AS "sectionId",
            s.teacher_id AS "teacherId",
            COALESCE(sec.name, 'Без секции') AS "sectionName",
            COALESCE(t.full_name, 'Без имени') AS "teacherName",
            (SELECT COUNT(*) FROM records r WHERE r.schedule_id = s.id) AS "clientCount",
            sec.max_participants AS "maxParticipants"
          FROM schedule s
          LEFT JOIN teachers t ON s.teacher_id = t.id
          LEFT JOIN sections sec ON s.section_id = sec.id
          ${whereSql}
          ORDER BY ${sortField} ${sortOrder}
          LIMIT $${values.length + 1}
          OFFSET $${values.length + 2}`,
        values: [...values, limit, offset]
      };

      // Запрос на подсчёт общего числа записей
      const countQuery = {
        text: `
          SELECT COUNT(*) 
          FROM schedule s
          LEFT JOIN teachers t ON s.teacher_id = t.id
          LEFT JOIN sections sec ON s.section_id = sec.id
          ${whereSql}`,
        values: [...values]
      };

      // Выполняем оба запроса параллельно
      const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery),
        pool.query(countQuery)
      ]);

      return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        currentPage: page
      };
    } catch (error) {
      throw new Error(`Ошибка получения расписания: ${error.message}`);
    }
  },
  // Получение секций преподавателя
  getTeacherSections: async (teacherId) => {
    try {
      const { rows } = await pool.query(
        `SELECT s.id, s.name 
         FROM sections s
         JOIN teacher_sections ts ON s.id = ts.section_id
         WHERE ts.teacher_id = $1`,
        [teacherId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Ошибка получения секций: ${error.message}`);
    }
  },

  // Проверка конфликта расписания
  checkScheduleConflict: async (teacherId, dateTime, duration, excludeId = null) => {
    try {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const formattedStartTime = `${hours}:${minutes}`;

      const query = {
        text: `
          SELECT id 
          FROM schedule
          WHERE teacher_id = $1
            AND date = $2::DATE
            AND (
              (start_time < ($3::TIME + ($4 || ' hours')::INTERVAL)
              AND start_time + ($4 || ' hours')::INTERVAL > $3::TIME)
            )
            ${excludeId ? 'AND id != $5' : ''}`,
        values: excludeId
          ? [teacherId, formattedDate, formattedStartTime, duration, excludeId]
          : [teacherId, formattedDate, formattedStartTime, duration]
      };

      const { rows } = await pool.query(query);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Ошибка проверки конфликтов: ${error.message}`);
    }
  },

  // Добавление новой записи
  create: async ({ dateTime, duration, sectionId, teacherId }) => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date)) throw new Error("Неверный формат даты");

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const formattedStartTime = `${hours}:${minutes}`;

      const { rows } = await pool.query(
        `INSERT INTO schedule 
          (date, start_time, duration, section_id, teacher_id, status)
         VALUES 
          ($1, $2, $3, $4, $5, 'free')
         RETURNING 
           id,
           date,
           start_time AS "startTime",
           duration,
           status,
           section_id AS "sectionId",
           teacher_id AS "teacherId",
           (SELECT name FROM sections WHERE id = $4) AS "sectionName",
           (SELECT full_name FROM teachers WHERE id = $5) AS "teacherName"`,
        [formattedDate, formattedStartTime, duration, sectionId, teacherId]
      );

      return rows[0];
    } catch (error) {
      throw new Error(`Ошибка создания записи: ${error.message}`);
    }
  },

  // Обновление записи
  update: async (id, { dateTime, duration, sectionId, teacherId }) => {
    try {
      const date = new Date(dateTime);
      let formattedDate = null;
      let formattedStartTime = null;

      if (date && !isNaN(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
        formattedStartTime = `${hours}:${minutes}`;
      }

      const { rows } = await pool.query(
        `UPDATE schedule
         SET
           date = COALESCE($1, date),
           start_time = COALESCE($2, start_time),
           duration = COALESCE($3, duration),
           section_id = COALESCE($4, section_id),
           teacher_id = COALESCE($5, teacher_id)
         WHERE id = $6
         RETURNING 
           id,
           date,
           start_time AS "startTime",
           duration,
           status,
           section_id AS "sectionId",
           teacher_id AS "teacherId",
           (SELECT name FROM sections WHERE id = COALESCE($4, section_id)) AS "sectionName",
           (SELECT full_name FROM teachers WHERE id = COALESCE($5, teacher_id)) AS "teacherName"`,
        [formattedDate, formattedStartTime, duration, sectionId, teacherId, id]
      );

      return rows[0];
    } catch (error) {
      throw new Error(`Ошибка обновления расписания: ${error.message}`);
    }
  },

  // Удаление записи
  delete: async (id) => {
    try {
      const result = await pool.query('DELETE FROM schedule WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Ошибка удаления расписания: ${error.message}`);
    }
  },

  // Получение записи по ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query(
        `SELECT 
          s.id,
          s.date,
          s.start_time AS "startTime",
          s.duration,
          s.status,
          s.section_id AS "sectionId",
          s.teacher_id AS "teacherId",
          sec.name AS "sectionName",
          t.full_name AS "teacherName"
         FROM schedule s
         LEFT JOIN sections sec ON s.section_id = sec.id
         LEFT JOIN teachers t ON s.teacher_id = t.id
         WHERE s.id = $1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Ошибка получения данных: ${error.message}`);
    }
  },

  // Получение клиентов по расписанию
  getClientsBySchedule: async (scheduleId) => {
    try {
      const result = await pool.query(
        `SELECT c.full_name
         FROM clients c
         JOIN records r ON c.id = r.client_id
         WHERE r.schedule_id = $1`,
        [scheduleId]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Ошибка получения клиентов: ${error.message}`);
    }
  }
};
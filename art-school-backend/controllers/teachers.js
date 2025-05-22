// controllers/teachers.js
const pool = require('../config/db');
const teachersModel = require('../models/teachers');
exports.getTeachers = async (req, res) => {
  try {
    // Валидация параметров
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = ['id', 'fullName'].includes(req.query.sort) ? req.query.sort : 'id';
    const order = ['asc', 'desc'].includes(req.query.order?.toLowerCase()) ? req.query.order.toLowerCase() : 'asc';
    const search = req.query.search || '';
    const sectionId = req.query.sectionId ? parseInt(req.query.sectionId) : null;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Некорректные параметры пагинации"
      });
    }

    // Получаем данные через модель
    const result = await teachersModel.findAll({
      page,
      limit,
      sort,
      order,
      search,
      sectionId
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Ошибка получения преподавателей:', error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при получении списка преподавателей",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Вспомогательная функция для форматирования телефона
function formatPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return match ? `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}` : phone;
};

exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = {
      text: `
        SELECT 
          t.id,
          t.full_name AS "fullName",
          t.phone,
          t.email,
          COALESCE(ARRAY_AGG(s.id) FILTER (WHERE s.id IS NOT NULL), ARRAY[]::integer[]) AS "sectionIds",
          COALESCE(ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL), ARRAY[]::text[]) AS "sectionNames"
        FROM teachers t
        LEFT JOIN teacher_sections ts ON t.id = ts.teacher_id
        LEFT JOIN sections s ON ts.section_id = s.id
        WHERE t.id = $1
        GROUP BY t.id
      `,
      values: [id]
    };

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Преподаватель не найден"
      });
    }

    const teacher = rows[0];
    
    // Гарантируем, что sectionIds и sectionNames всегда будут массивами
    teacher.sectionIds = teacher.sectionIds || [];
    teacher.sectionNames = teacher.sectionNames || [];

    res.status(200).json({
      success: true,
      data: teacher
    });

  } catch (error) {
    console.error('Ошибка получения преподавателя:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка получения преподавателя: ${error.message}`
    });
  }
};

exports.createTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { fullName, phone, email, sectionIds = [] } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "ФИО преподавателя обязательно"
      });
    }

    // Вставка основный данных преподавателя
    const insertTeacherQuery = {
      text: `
        INSERT INTO teachers (full_name, phone, email)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      values: [fullName.trim(), phone, email]
    };

    const teacherResult = await client.query(insertTeacherQuery);
    const teacherId = teacherResult.rows[0].id;

    // Добавление связей с секциями
    if (sectionIds.length > 0) {
      // Проверка существования секций
      const checkSectionsQuery = {
        text: 'SELECT id FROM sections WHERE id = ANY($1::int[])',
        values: [sectionIds]
      };
      
      const sectionsCheck = await client.query(checkSectionsQuery);
      
      if (sectionsCheck.rowCount !== sectionIds.length) {
        return res.status(400).json({
          success: false,
          message: "Одна или несколько указанных секций не существуют"
        });
      }

      // Вставка связей
      const insertRelationsQuery = {
        text: `
          INSERT INTO teacher_sections (teacher_id, section_id)
          SELECT $1, unnest($2::int[])
        `,
        values: [teacherId, sectionIds]
      };

      await client.query(insertRelationsQuery);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: { id: teacherId }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка создания преподавателя:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка создания преподавателя: ${error.message}`
    });
  } finally {
    client.release();
  }
};

exports.updateTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { fullName, phone, email, sectionIds = [] } = req.body;

    // Обновление основных данных
    const updateTeacherQuery = {
      text: `
        UPDATE teachers
        SET full_name = $1,
            phone = $2,
            email = $3
        WHERE id = $4
        RETURNING id, full_name AS "fullName", phone, email
      `,
      values: [fullName, phone, email, id]
    };

    const updateResult = await client.query(updateTeacherQuery);
    
    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Преподаватель не найден"
      });
    }

    // Обновление связей с секциями
    await client.query(
      'DELETE FROM teacher_sections WHERE teacher_id = $1',
      [id]
    );

    if (sectionIds.length > 0) {
      // Проверка существования секций
      const checkSectionsQuery = {
        text: 'SELECT id FROM sections WHERE id = ANY($1::int[])',
        values: [sectionIds]
      };
      
      const sectionsCheck = await client.query(checkSectionsQuery);
      
      if (sectionsCheck.rowCount !== sectionIds.length) {
        return res.status(400).json({
          success: false,
          message: "Одна или несколько указанных секций не существуют"
        });
      }

      // Вставка новых связей
      const insertRelationsQuery = {
        text: `
          INSERT INTO teacher_sections (teacher_id, section_id)
          SELECT $1, unnest($2::int[])
        `,
        values: [id, sectionIds]
      };

      await client.query(insertRelationsQuery);
    }

    await client.query('COMMIT');

    // Возвращаем обновленные данные
    const updatedTeacher = updateResult.rows[0];
    updatedTeacher.sectionIds = sectionIds;
    
    res.status(200).json({
      success: true,
      data: updatedTeacher
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка обновления преподавателя:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка обновления преподавателя: ${error.message}`
    });
  } finally {
    client.release();
  }
};

exports.deleteTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Удаление связей с секциями
    await client.query(
      'DELETE FROM teacher_sections WHERE teacher_id = $1',
      [id]
    );

    // Удаление преподавателя
    const deleteQuery = {
      text: 'DELETE FROM teachers WHERE id = $1',
      values: [id]
    };

    const result = await client.query(deleteQuery);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Преподаватель не найден"
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Преподаватель успешно удален"
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка удаления преподавателя:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка удаления преподавателя: ${error.message}`
    });
  } finally {
    client.release();
  }
};

exports.getTeacherSections = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Валидация teacherId
    if (!teacherId || isNaN(parseInt(teacherId))) {
      return res.status(400).json({
        success: false,
        message: "Некорректный ID преподавателя"
      });
    }

    const parsedTeacherId = parseInt(teacherId);

    const query = {
      text: `
        SELECT 
          s.id, 
          s.name,
          s.description,
          s.max_participants AS "maxParticipants"
        FROM sections s
        JOIN teacher_sections ts ON s.id = ts.section_id
        WHERE ts.teacher_id = $1
        ORDER BY s.name ASC
      `,
      values: [parsedTeacherId]
    };

    const { rows } = await pool.query(query);

    res.status(200).json({
      success: true,
      data: rows,
      teacherId: parsedTeacherId
    });

  } catch (error) {
    console.error('Ошибка получения секций преподавателя:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка получения секций преподавателя: ${error.message}`,
      errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
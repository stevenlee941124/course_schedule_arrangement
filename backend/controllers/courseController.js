const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// 新增課程
exports.addCourse = (req, res) => {
  const { name, time } = req.body;
  
  // 驗證輸入
  if (!name || !time) {
    return res.status(400).json({ error: '課程名稱和時間不能為空' });
  }

  const id = uuidv4();

  db.run(
    'INSERT INTO courses (id, name, time) VALUES (?, ?, ?)',
    [id, name, time],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, name, time });
      }
    }
  );
};

// 取得所有課程
exports.getCourses = (req, res) => {
  db.all('SELECT * FROM courses', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
};

// 更新課程
exports.updateCourse = (req, res) => {
  const { id } = req.params;
  const { name, time } = req.body;

  if (!name || !time) {
    return res.status(400).json({ error: '課程名稱和時間不能為空' });
  }

  db.run(
    'UPDATE courses SET name = ?, time = ? WHERE id = ?',
    [name, time, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, name, time });
      }
    }
  );
};

// 刪除課程
exports.deleteCourse = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM courses WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '課程已刪除' });
    }
  });
};
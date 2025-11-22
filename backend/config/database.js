const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/courses.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // 創建 courses 表（包含新欄位）
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      time TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'general',
      color TEXT DEFAULT '#a5b4fc',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating courses table:', err.message);
    } else {
      console.log('Courses table ready');
      
      // 嘗試添加新欄位（如果表已存在但沒有這些欄位）
      addColumnIfNotExists('courses', 'type', 'TEXT DEFAULT "general"');
      addColumnIfNotExists('courses', 'color', 'TEXT DEFAULT "#a5b4fc"');
    }
  });

  // 創建 selections 表
  db.run(`
    CREATE TABLE IF NOT EXISTS selections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating selections table:', err.message);
    } else {
      console.log('Selections table ready');
    }
  });

  // 創建索引
  db.run('CREATE INDEX IF NOT EXISTS idx_course_time ON courses(time)');
  db.run('CREATE INDEX IF NOT EXISTS idx_selection_user ON selections(user_id)');
}

// 輔助函數：添加欄位（如果不存在）
function addColumnIfNotExists(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, (err, columns) => {
    if (err) {
      console.error(`Error checking table ${table}:`, err.message);
      return;
    }
    
    const columnExists = columns.some(col => col.name === column);
    
    if (!columnExists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
        if (err) {
          console.error(`Error adding column ${column} to ${table}:`, err.message);
        } else {
          console.log(`Added column ${column} to ${table}`);
        }
      });
    }
  });
}

module.exports = db;
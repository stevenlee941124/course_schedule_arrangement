const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 確保 database 資料夾存在
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'courses.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('資料庫連接錯誤:', err);
  } else {
    console.log('? 資料庫已連接');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 建立課程表
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        time TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('建立 courses 表時出錯:', err);
      } else {
        console.log('? courses 表已準備好');
      }
    });
  });
}

module.exports = db;
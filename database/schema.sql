CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general',  -- 新增：課程類型 (general, required, elective, major, etc.)
  color TEXT DEFAULT '#a5b4fc',  -- 新增：課程顏色
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS selections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_time ON courses(time);
CREATE INDEX IF NOT EXISTS idx_selection_user ON selections(user_id);

-- 如果表已存在，添加新欄位（SQLite 的 ALTER TABLE 語法）
-- 注意：這些語句在表已有新欄位時會失敗，這是正常的
-- ALTER TABLE courses ADD COLUMN type TEXT DEFAULT 'general';
-- ALTER TABLE courses ADD COLUMN color TEXT DEFAULT '#a5b4fc';
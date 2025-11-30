const express = require('express');
const cors = require('cors');
require('dotenv').config();
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/courses', courseRoutes);

// 基本路由測試
app.get('/', (req, res) => {
  res.json({ message: '課程管理系統後端已啟動' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '伺服器錯誤', message: err.message });
});

app.listen(PORT, () => {
  console.log(`? 伺服器運行在 http://localhost:${PORT}`);
});
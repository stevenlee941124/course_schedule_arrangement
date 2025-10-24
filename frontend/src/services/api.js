import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

export const courseApi = {
  // 新增課程
  addCourse: (courseData) => api.post('/courses', courseData),

  // 取得所有課程
  getCourses: () => api.get('/courses'),

  // 更新課程
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),

  // 刪除課程
  deleteCourse: (id) => api.delete(`/courses/${id}`)
};

export default api;
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// 定義路由
router.post('/', courseController.addCourse);        // POST /api/courses
router.get('/', courseController.getCourses);        // GET /api/courses
router.put('/:id', courseController.updateCourse);   // PUT /api/courses/:id
router.delete('/:id', courseController.deleteCourse); // DELETE /api/courses/:id

module.exports = router;
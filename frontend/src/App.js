import React, { useState, useEffect } from 'react';
import { courseApi } from './services/api';
import CourseInput from './components/CourseInput';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert('Cannot connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseData) => {
    try {
      if (editingCourse) {
        await courseApi.updateCourse(courseData.id, {
          name: courseData.name,
          time: courseData.time
        });
      } else {
        await courseApi.addCourse({
          name: courseData.name,
          time: courseData.time
        });
      }
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.deleteCourse(id);
        setSelectedCourses(selectedCourses.filter(sc => sc !== id));
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course');
      }
    }
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const parseTime = (timeStr) => {
    const day = parseInt(timeStr[0]) - 1;
    const periodArray = timeStr.slice(1).split('').map(Number);
    return { day, periods: periodArray };
  };

  const getCourseForSlot = (day, period) => {
    return courses.find(course => {
      if (!selectedCourses.includes(course.id)) return false;
      const { day: courseDay, periods: coursePeriods } = parseTime(course.time);
      return courseDay === day && coursePeriods.includes(period);
    });
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eff6fc', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>
          Course Management System
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div style={{ maxHeight: '600px', overflow: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '24px' }}>
            <CourseInput 
              onAddCourse={handleAddCourse}
              editingCourse={editingCourse}
              onCancelEdit={() => setEditingCourse(null)}
            />

            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '24px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                Course List
              </h3>
              {courses.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No courses yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {courses.map(course => (
                    <div
                      key={course.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', color: '#1f2937' }}>
                          {course.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          Time: {course.time}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingCourse(course)}
                          style={{
                            color: '#3b82f6',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          style={{
                            color: '#ef4444',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '24px', overflowX: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              My Schedule
            </h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', padding: '12px', fontWeight: 'bold', width: '60px' }}>
                    Period
                  </th>
                  {daysOfWeek.map((day, idx) => (
                    <th
                      key={idx}
                      style={{
                        border: '1px solid #d1d5db',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px',
                        fontWeight: 'bold',
                        width: '120px'
                      }}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map(period => (
                  <tr key={period}>
                    <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                      {period}
                    </td>
                    {daysOfWeek.map((_, dayIdx) => {
                      const course = getCourseForSlot(dayIdx, parseInt(period));
                      const bgColor = course && selectedCourses.includes(course.id)
                        ? '#a5b4fc'
                        : 'white';
                      return (
                        <td
                          key={`${dayIdx}-${period}`}
                          style={{
                            border: '1px solid #d1d5db',
                            backgroundColor: bgColor,
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1f2937',
                            height: '64px'
                          }}
                        >
                          {course ? <div style={{ fontSize: '14px' }}>{course.name}</div> : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCourses.length === 0 && (
              <div style={{ marginTop: '32px', padding: '32px', backgroundColor: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '18px' }}>
                  No courses selected. Please check courses on the left to add them to your schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
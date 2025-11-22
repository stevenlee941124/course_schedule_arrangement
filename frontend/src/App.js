import React, { useState, useEffect } from 'react';
import { courseApi } from './services/api';
import CourseInput from './components/CourseInput';
import ConflictModal from './components/ConflictModal';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictData, setConflictData] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);

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
          time: courseData.time,
          type: courseData.type,
          color: courseData.color
        });
      } else {
        await courseApi.addCourse({
          name: courseData.name,
          time: courseData.time,
          type: courseData.type,
          color: courseData.color
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

  // Check for time conflicts
  const checkConflict = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return { hasConflict: false, conflicts: [] };

    try {
      const response = await courseApi.checkConflict(course.time);
      const conflictingCourses = response.data.conflicts.filter(c => 
        c.id !== courseId && selectedCourses.includes(c.id)
      );
      
      return {
        hasConflict: conflictingCourses.length > 0,
        conflicts: conflictingCourses
      };
    } catch (error) {
      console.error('Failed to check conflict:', error);
      return { hasConflict: false, conflicts: [] };
    }
  };

  // Handle course selection/deselection
  const toggleCourse = async (courseId) => {
    const isCurrentlySelected = selectedCourses.includes(courseId);
    
    if (isCurrentlySelected) {
      // Deselect - remove directly
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    } else {
      // Select - check for conflicts
      const { hasConflict, conflicts } = await checkConflict(courseId);
      
      if (hasConflict) {
        // Show conflict warning modal
        setConflictData({ conflicts });
        setPendingSelection(courseId);
      } else {
        // No conflict - add directly
        setSelectedCourses(prev => [...prev, courseId]);
      }
    }
  };

  // Confirm and override conflicting courses
  const handleConfirmConflict = () => {
    if (pendingSelection && conflictData) {
      // Remove all conflicting courses
      const conflictIds = conflictData.conflicts.map(c => c.id);
      setSelectedCourses(prev => {
        const filtered = prev.filter(id => !conflictIds.includes(id));
        return [...filtered, pendingSelection];
      });
      
      // Close modal
      setConflictData(null);
      setPendingSelection(null);
    }
  };

  // Cancel selection
  const handleCancelConflict = () => {
    setConflictData(null);
    setPendingSelection(null);
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

  // Get course type display name
  const getCourseTypeName = (type) => {
    const typeNames = {
      'general': 'General',
      'required': 'Required',
      'elective': 'Elective',
      'major': 'Major',
      'minor': 'Minor',
      'lab': 'Lab'
    };
    return typeNames[type] || type;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#eff6fc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>?</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eff6fc', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>?</span>
          Course Management System
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '14px' }}>
          Manage your courses easily with conflict detection and custom colors
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Left: Course Input & List */}
          <div style={{ 
            maxHeight: '800px', 
            overflow: 'auto', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <CourseInput 
              onAddCourse={handleAddCourse}
              editingCourse={editingCourse}
              onCancelEdit={() => setEditingCourse(null)}
            />

            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '24px', marginTop: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>?</span>
                Course List
                <span style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {courses.length}
                </span>
              </h3>
              
              {courses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9ca3af'
                }}>
                  <p style={{ fontSize: '48px', marginBottom: '8px' }}>?</p>
                  <p style={{ fontSize: '14px' }}>No courses yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Add a course using the form above</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {courses.map(course => (
                    <div
                      key={course.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: selectedCourses.includes(course.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          cursor: 'pointer',
                          accentColor: '#3b82f6'
                        }}
                      />
                      <div 
                        style={{ 
                          width: '8px', 
                          height: '48px', 
                          borderRadius: '4px',
                          backgroundColor: course.color || '#a5b4fc',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {course.name}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ 
                            fontSize: '11px', 
                            color: 'white',
                            backgroundColor: '#6b7280',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {course.time}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#3b82f6',
                            backgroundColor: '#eff6ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {getCourseTypeName(course.type)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => setEditingCourse(course)}
                          style={{
                            padding: '6px 12px',
                            color: '#3b82f6',
                            backgroundColor: '#eff6ff',
                            fontWeight: '600',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#eff6ff'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          style={{
                            padding: '6px 12px',
                            color: '#ef4444',
                            backgroundColor: '#fef2f2',
                            fontWeight: '600',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#fef2f2'}
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

          {/* Right: Schedule Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)', 
            padding: '24px', 
            overflowX: 'auto' 
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>?</span>
              My Schedule
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>
              {selectedCourses.length} courses selected
            </p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    backgroundColor: '#f9fafb', 
                    padding: '12px', 
                    fontWeight: 'bold', 
                    width: '60px',
                    fontSize: '13px'
                  }}>
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
                        width: '140px',
                        fontSize: '14px'
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
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      backgroundColor: '#f9fafb', 
                      padding: '12px', 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {period}
                    </td>
                    {daysOfWeek.map((_, dayIdx) => {
                      const course = getCourseForSlot(dayIdx, parseInt(period));
                      return (
                        <td
                          key={`${dayIdx}-${period}`}
                          style={{
                            border: '1px solid #d1d5db',
                            backgroundColor: course ? course.color : 'white',
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1f2937',
                            height: '70px',
                            verticalAlign: 'middle'
                          }}
                        >
                          {course && (
                            <div>
                              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                {course.name}
                              </div>
                              <div style={{ 
                                fontSize: '10px', 
                                color: '#4b5563',
                                fontWeight: '500'
                              }}>
                                {getCourseTypeName(course.type)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCourses.length === 0 && (
              <div style={{ 
                marginTop: '32px', 
                padding: '40px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <p style={{ fontSize: '48px', marginBottom: '12px' }}>?</p>
                <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>
                  No courses selected
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Check courses on the left to add them to your schedule
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Warning Modal */}
      {conflictData && (
        <ConflictModal
          conflicts={conflictData.conflicts}
          onConfirm={handleConfirmConflict}
          onCancel={handleCancelConflict}
        />
      )}
    </div>
  );
}

export default App;
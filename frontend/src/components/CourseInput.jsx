import React, { useState } from 'react';

const CourseInput = ({ onAddCourse, editingCourse, onCancelEdit }) => {
  const [courseName, setCourseName] = useState(editingCourse?.name || '');
  const [courseTime, setCourseTime] = useState(editingCourse?.time || '');

  const handleSubmit = () => {
    if (!courseName.trim() || !courseTime.trim()) {
      alert('Please enter course name and time');
      return;
    }

    if (!/^[1-5][0-9]+$/.test(courseTime)) {
      alert('Please enter correct time format (e.g. 1234 means Monday periods 2, 3 and 4)');
      return;
    }

    onAddCourse({
      name: courseName,
      time: courseTime,
      id: editingCourse?.id
    });

    setCourseName('');
    setCourseTime('');
  };

  const handleCancel = () => {
    setCourseName('');
    setCourseTime('');
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {editingCourse ? 'Edit Course' : 'Add Course'}
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Course Name
        </label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g. Mathematics"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Time Format
        </label>
        <input
          type="text"
          value={courseTime}
          onChange={(e) => setCourseTime(e.target.value)}
          placeholder="e.g. 289"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}
        />
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Format: First digit is day (1-5), rest are periods<br/>
          Example: 289 = Tuesday (2) periods 8 and 9
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {editingCourse ? 'Update' : 'Add'}
        </button>
        {editingCourse && (
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              backgroundColor: '#d1d5db',
              color: '#1f2937',
              fontWeight: 'bold',
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseInput;
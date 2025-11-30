import React, { useState, useEffect } from 'react';

// Course type options (修復：將 ? 改為對應的 Emoji)
const courseTypes = [
  { value: 'general', label: 'General', icon: '📖' },
  { value: 'required', label: 'Required', icon: '⭐' },
  { value: 'elective', label: 'Elective', icon: '🎨' },
  { value: 'major', label: 'Major', icon: '🎯' },
  { value: 'minor', label: 'Minor', icon: '🌱' },
  { value: 'lab', label: 'Lab', icon: '🧪' }
];

// Default color options
const colorOptions = [
  '#a5b4fc', // Purple
  '#93c5fd', // Blue
  '#6ee7b7', // Green
  '#fcd34d', // Yellow
  '#fca5a5', // Red
  '#f9a8d4', // Pink
  '#c4b5fd', // Light purple
  '#fdba74', // Orange
  '#86efac', // Light green
  '#bfdbfe'  // Light blue
];

const CourseInput = ({ onAddCourse, editingCourse, onCancelEdit }) => {
  const [courseName, setCourseName] = useState('');
  const [courseTime, setCourseTime] = useState('');
  const [courseType, setCourseType] = useState('general');
  const [courseColor, setCourseColor] = useState('#a5b4fc');
  const [customColor, setCustomColor] = useState('');

  // Fill form when editing
  useEffect(() => {
    if (editingCourse) {
      setCourseName(editingCourse.name || '');
      setCourseTime(editingCourse.time || '');
      setCourseType(editingCourse.type || 'general');
      setCourseColor(editingCourse.color || '#a5b4fc');
      setCustomColor(editingCourse.color || '');
    } else {
      // Reset form
      setCourseName('');
      setCourseTime('');
      setCourseType('general');
      setCourseColor('#a5b4fc');
      setCustomColor('');
    }
  }, [editingCourse]);

  const handleSubmit = () => {
    if (!courseName.trim() || !courseTime.trim()) {
      alert('Please enter course name and time');
      return;
    }

    if (!/^[1-5][0-9]+$/.test(courseTime)) {
      alert('Please enter correct time format (e.g. 1234 means Monday periods 2, 3, 4)');
      return;
    }

    onAddCourse({
      name: courseName,
      time: courseTime,
      type: courseType,
      color: courseColor,
      id: editingCourse?.id
    });

    // Reset form
    setCourseName('');
    setCourseTime('');
    setCourseType('general');
    setCourseColor('#a5b4fc');
    setCustomColor('');
  };

  const handleCancel = () => {
    setCourseName('');
    setCourseTime('');
    setCourseType('general');
    setCourseColor('#a5b4fc');
    setCustomColor('');
    if (onCancelEdit) onCancelEdit();
  };

  const handleColorSelect = (color) => {
    setCourseColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    setCourseColor(color);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {/* 修復：標題的問號改為 Emoji */}
        {editingCourse ? '✏️ Edit Course' : '➕ Add Course'}
      </h2>

      {/* Course Name */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Course Name
        </label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g. Data Structures"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxSizing: 'border-box',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Time Format */}
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
            boxSizing: 'border-box',
            fontSize: '14px'
          }}
        />
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Format: First digit is day (1-5), rest are periods<br/>
          Example: 289 = Tuesday (2) periods 8 and 9
        </p>
      </div>

      {/* Course Type */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Course Type
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {courseTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setCourseType(type.value)}
              style={{
                padding: '10px',
                border: courseType === type.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: courseType === type.value ? '#eff6ff' : 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: courseType === type.value ? '600' : '400',
                color: courseType === type.value ? '#1e40af' : '#4b5563',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Course Color */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Course Color
        </label>
        
        {/* Default color options */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: color,
                border: courseColor === color ? '3px solid #1f2937' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title={color}
            >
              {courseColor === color && (
                <span style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '18px'
                }}>
                  {/* 修復：選中顏色的問號改為打勾 */}
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Custom color */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            style={{
              width: '60px',
              height: '40px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange({ target: { value: e.target.value } })}
            placeholder="#a5b4fc"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px'
            }}
          />
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
          {/* 修復：提示文字前的問號 */}
          💡 Choose a preset color or use the custom color picker
        </p>
      </div>

      {/* Preview */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px'
      }}>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
          Preview:
        </p>
        <div style={{
          padding: '12px',
          backgroundColor: courseColor,
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            {courseName || 'Course Name'}
          </p>
          <p style={{ fontSize: '12px', color: '#4b5563' }}>
            {courseTypes.find(t => t.value === courseType)?.label || 'Course Type'}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          {/* 修復：按鈕上的問號 */}
          {editingCourse ? '💾 Update' : '➕ Add Course'}
        </button>
        {editingCourse && (
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              backgroundColor: '#d1d5db',
              color: '#1f2937',
              fontWeight: 'bold',
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#9ca3af'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#d1d5db'}
          >
            {/* 修復：取消按鈕上的問號 */}
            🚫 Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseInput;
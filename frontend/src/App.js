import React, { useState } from 'react';
import { Plus, Trash2, Edit2, BookOpen, Clock, Calendar } from 'lucide-react';
import ConflictModal from './components/ConflictModal'; // 引入剛剛的 Modal

const App = () => {
  // 1. 狀態管理
  const [courses, setCourses] = useState([]); // 存放所有課程
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    period: '1',
    type: 'Major',
    color: '#a5b4fc' // 預設顏色
  });

  // 衝堂處理用的狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [pendingCourse, setPendingCourse] = useState(null); // 暫存要加入的課程

  // 預設顏色盤
  const colorPalette = [
    '#fca5a5', '#fdba74', '#fcd34d', '#86efac', 
    '#93c5fd', '#a5b4fc', '#d8b4fe', '#f0abfc'
  ];

  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. 核心邏輯：新增課程 (含衝堂檢查)
  const handleAddCourse = () => {
    if (!formData.name) return alert("請輸入課程名稱");

    const newCourse = {
      id: Date.now(), // 產生唯一 ID
      ...formData,
      period: parseInt(formData.period) // 確保節次是數字
    };

    // 檢查是否衝堂
    const existingCourse = courses.find(
      c => c.day === newCourse.day && c.period === newCourse.period
    );

    if (existingCourse) {
      // 如果有衝堂，設定訊息並打開 Modal
      setConflictMessage(`「${existingCourse.day} 第 ${existingCourse.period} 節」已經有課程：${existingCourse.name}。是否覆蓋？`);
      setPendingCourse(newCourse);
      setIsModalOpen(true);
    } else {
      // 沒衝堂，直接加入
      setCourses([...courses, newCourse]);
    }
  };

  // 確認覆蓋 (Modal 的 Confirm 按鈕)
  const confirmOverride = () => {
    if (pendingCourse) {
      // 移除舊的 (相同時間的)，加入新的
      const filteredCourses = courses.filter(
        c => !(c.day === pendingCourse.day && c.period === pendingCourse.period)
      );
      setCourses([...filteredCourses, pendingCourse]);
      
      // 重置狀態
      setIsModalOpen(false);
      setPendingCourse(null);
    }
  };

  // 刪除課程
  const deleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // 3. 渲染課表格子 (這裡修復了顏色顯示問題)
  const renderCell = (day, period) => {
    const course = courses.find(c => c.day === day && c.period === period);

    if (course) {
      return (
        <div 
          className="h-full w-full p-2 rounded-md shadow-sm text-sm flex flex-col justify-center items-center text-center"
          style={{ backgroundColor: course.color, color: '#333' }} // ★ 關鍵：這裡應用顏色
        >
          <span className="font-bold block">{course.name}</span>
          <span className="text-xs opacity-75">{course.type}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      {/* 衝堂警示視窗 */}
      <ConflictModal 
        isOpen={isModalOpen} 
        message={conflictMessage} 
        onConfirm={confirmOverride} 
        onCancel={() => setIsModalOpen(false)} 
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Course Management System
        </h1>
        <p className="text-slate-500">Manage your courses easily with conflict detection and custom colors</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左側：控制面板 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Edit2 size={20} /> Add New Course
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md" 
                  placeholder="Ex: Linear Algebra" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Day</label>
                  <select name="day" value={formData.day} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period</label>
                  <select name="period" value={formData.period} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="Major, Elective..." />
              </div>

              {/* 顏色選擇器 */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-slate-600' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    name="color" 
                    value={formData.color} 
                    onChange={handleInputChange} 
                    className="h-8 w-12 p-0 border-0" 
                  />
                  <span className="text-xs text-slate-500">{formData.color}</span>
                </div>
              </div>

              {/* 預覽 */}
              <div className="p-4 rounded-lg text-center mt-4" style={{ backgroundColor: formData.color }}>
                <span className="font-bold block text-slate-800">{formData.name || 'Course Name'}</span>
                <span className="text-sm opacity-75 text-slate-800">{formData.type}</span>
              </div>

              <button 
                onClick={handleAddCourse}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Plus size={20} /> Add Course
              </button>
            </div>
          </div>

          {/* 下方：課程列表 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Course List ({courses.length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {courses.length === 0 ? <p className="text-slate-400 text-center">No courses yet.</p> : null}
              {courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: course.color }}></div>
                    <div>
                      <div className="font-bold">{course.name}</div>
                      <div className="text-xs text-slate-500">{course.day} - Period {course.period}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteCourse(course.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側：課表網格 */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} /> My Schedule
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="border p-3 bg-slate-50 w-16">Period</th>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <th key={day} className="border p-3 bg-blue-600 text-white w-1/5">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                    <tr key={period}>
                      <td className="border p-3 text-center font-bold text-slate-500 bg-slate-50">{period}</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <td key={`${day}-${period}`} className="border p-1 h-24 align-top relative hover:bg-slate-50 transition-colors">
                          {renderCell(day, period)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
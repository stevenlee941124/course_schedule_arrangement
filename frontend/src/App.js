import React, { useState } from 'react';
import { Plus, Trash2, Edit2, BookOpen, Calendar, Clock, X } from 'lucide-react';
import ConflictModal from './components/ConflictModal';

const App = () => {
  // 1. 狀態管理
  const [courses, setCourses] = useState([]); // 存放所有課程

  // 用來設定新課程的表單資料
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    startPeriod: '1', // 更改為範圍選擇的起始節次
    endPeriod: '1',   // 更改為範圍選擇的結束節次
    type: 'Major',
    color: '#a5b4fc'
  });

  // 衝堂處理用的狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [pendingCourses, setPendingCourses] = useState([]); // 暫存要加入的一組課程

  // Grid 點擊互動用的狀態
  const [isGridMode, setIsGridMode] = useState(false); // 控制是否在 "Grid 點擊模式"
  const [selectedGridCell, setSelectedGridCell] = useState(null); // 點擊格子後，暫存該格子的 (day, period)

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
  
  // 3. 核心邏輯：建立課程物件 (處理多節次)
  const createCourseObjects = () => {
    if (!formData.name) return [];
    
    // 確保節次是數字
    const start = parseInt(formData.startPeriod);
    const end = parseInt(formData.endPeriod);

    if (start > end) {
      alert("起始節次不能大於結束節次！");
      return [];
    }

    const newCourses = [];
    // 迴圈產生該時間範圍內的所有課程物件
    for (let period = start; period <= end; period++) {
      newCourses.push({
        id: Date.now() + period, // 確保每個節次有唯一 ID
        name: formData.name,
        day: formData.day,
        period: period,
        type: formData.type,
        color: formData.color,
        // 額外資訊：讓 renderCell 知道這是一個多節次課程的哪個部分
        isStart: period === start, 
        duration: end - start + 1 
      });
    }
    return newCourses;
  };

  // 4. 處理新增課程按鈕點擊
  const handleAddCourse = () => {
    const newCourses = createCourseObjects();
    if (newCourses.length === 0) return;

    checkAndAddCourses(newCourses);
  };
  
  // 5. 處理 Grid 點擊事件 (點擊課表格子)
  const handleGridClick = (day, period) => {
    // 1. 如果點擊時，該格已經有課，則執行刪除
    const existingCourse = courses.find(c => c.day === day && c.period === period);
    if (existingCourse) {
      // 找到該課程物件中的任一個節次 ID
      const baseCourse = courses.find(c => c.name === existingCourse.name && c.day === existingCourse.day);
      if (baseCourse) {
        // 刪除該課程所有節次
        if (window.confirm(`確定要刪除課程「${baseCourse.name}」在 ${baseCourse.day} 的所有節次嗎？`)) {
           setCourses(prevCourses => prevCourses.filter(c => c.name !== baseCourse.name || c.day !== baseCourse.day));
        }
      }
      return;
    }

    // 2. 如果點擊時，該格沒課，則進入新增模式
    setIsGridMode(true);
    // 預設將 Day 和 StartPeriod 設定為點擊的格子
    setFormData(prev => ({
        ...prev,
        day: day,
        startPeriod: String(period),
        endPeriod: String(period)
    }));
    setSelectedGridCell({ day, period });
  };


  // 6. 衝堂檢查與加入邏輯
  const checkAndAddCourses = (newCourses) => {
    let conflictFound = false;
    let conflictDetails = [];

    newCourses.forEach(newC => {
      const existingC = courses.find(
        c => c.day === newC.day && c.period === newC.period
      );

      if (existingC) {
        conflictFound = true;
        conflictDetails.push(`${newC.day} 第 ${newC.period} 節 (${existingC.name})`);
      }
    });

    if (conflictFound) {
      // 如果有衝堂，打開 Modal
      setConflictMessage(
        `以下時段發生衝堂：\n${conflictDetails.join(', ')}\n\n是否覆蓋這些時段？`
      );
      setPendingCourses(newCourses);
      setIsModalOpen(true);
    } else {
      // 沒衝堂，直接加入
      setCourses(prevCourses => [...prevCourses, ...newCourses]);
      setIsGridMode(false); // 新增成功，退出 Grid 模式
    }
  };

  // 7. 確認覆蓋 (Modal 的 Confirm 按鈕)
  const confirmOverride = () => {
    if (pendingCourses.length > 0) {
      let currentCourses = [...courses];
      
      // 先從現有課程中，刪除所有與 pendingCourses 衝突的時段
      pendingCourses.forEach(pendingC => {
        currentCourses = currentCourses.filter(
          c => !(c.day === pendingC.day && c.period === pendingC.period)
        );
      });

      // 加入新的課程
      setCourses([...currentCourses, ...pendingCourses]);
      
      // 重置狀態
      setIsModalOpen(false);
      setPendingCourses([]);
      setIsGridMode(false); // 退出 Grid 模式
    }
  };


  // 8. 渲染課表格子 (處理多節次樣式)
  const renderCell = (day, period) => {
    // 找到該格子的課程
    const course = courses.find(c => c.day === day && c.period === period);

    if (course) {
      // 找到該課程是從哪一節開始的 (只在起始節次渲染完整的 div)
      const isStart = courses.some(
          c => c.name === course.name && c.day === course.day && c.period < period
      ) === false; // 判斷是否為課程的第一節

      // 計算該課程連續幾節 (只算一次)
      const duration = courses.filter(
          c => c.name === course.name && c.day === course.day && c.period >= period
      ).length;
      
      // 如果不是起始節次，則不需要渲染內容，格子會被上一個節次的 div 覆蓋
      if (!isStart) return null;

      return (
        <div 
          // height: calc(duration * 6rem - 4px) 
          style={{ 
            backgroundColor: course.color, 
            color: '#333', 
            gridRow: `${period} / span ${duration}`,
            height: `${duration * 6.25}rem`, // 假設每個格子 6rem (h-24) + border 
          }}
          className={`absolute inset-0 w-full p-2 rounded-md shadow-sm text-sm flex flex-col justify-center items-center text-center cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation(); // 避免點擊刪除時觸發 GridClick
            handleGridClick(day, period);
          }}
        >
          <span className="font-bold block text-sm">{course.name}</span>
          <span className="text-xs opacity-75">{course.type}</span>
          <Trash2 size={12} className="mt-1 text-red-500 hover:text-red-700 opacity-80" />
        </div>
      );
    }
    return null;
  };


  // 9. 渲染課程列表 (簡化版)
  const renderCourseList = () => {
    // 找出所有唯一的課程 (因為多節次課程會有重複的 name+day)
    const uniqueCourses = courses.reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name && item.day === current.day);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    return uniqueCourses.map(course => {
        // 找出該課程的所有節次，並排序
        const periods = courses
            .filter(c => c.name === course.name && c.day === course.day)
            .map(c => c.period)
            .sort((a, b) => a - b);
        
        // 格式化節次範圍 (例如: 1-3)
        let periodDisplay = periods.length === 0 ? '' : periods[0].toString();
        if (periods.length > 1) {
            periodDisplay += periods[periods.length - 1] > periods[0] + 1 ? 
                             `-${periods[periods.length - 1]}` : 
                             (periods.map((p, i) => i > 0 ? `,${p}` : '')).join('');
        }

        return (
            <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: course.color }}></div>
                    <div>
                        <div className="font-bold">{course.name}</div>
                        <div className="text-xs text-slate-500">{course.day} - Period {periodDisplay} ({course.type})</div>
                    </div>
                </div>
                <button onClick={() => deleteCourse(course.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                </button>
            </div>
        );
    });
  };

  // 渲染 Section 選擇
  const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      {/* 衝堂警示視窗 */}
      <ConflictModal 
        isOpen={isModalOpen} 
        message={conflictMessage} 
        onConfirm={confirmOverride} 
        onCancel={() => {
          setIsModalOpen(false);
          setPendingCourses([]);
          setIsGridMode(false); // 取消時也要退出 Grid 模式
        }} 
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
              
              {/* Grid 互動提示 */}
              <div className={`p-3 rounded-lg text-sm font-medium transition-all ${isGridMode ? 'bg-green-100 text-green-800 border-2 border-green-400' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                {isGridMode ? (
                    <div className='flex items-center justify-between'>
                        <span>? 課程資訊已輸入，點擊下方 **"Confirm Add"** 完成新增。</span>
                        <X size={18} className='cursor-pointer' onClick={() => setIsGridMode(false)} />
                    </div>
                ) : (
                    <span>? **點擊課表上的空格**，自動選定時間並開始新增。</span>
                )}
              </div>

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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Calendar size={14} /> Day</label>
                  <select name="day" value={formData.day} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                {/* 範圍選擇 - Start Period */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Clock size={14} /> From</label>
                  <select name="startPeriod" value={formData.startPeriod} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {periodOptions.map(p => (
                      <option key={`start-${p}`} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                
                {/* 範圍選擇 - End Period */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">To</label>
                  <select name="endPeriod" value={formData.endPeriod} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {periodOptions
                        .filter(p => p >= parseInt(formData.startPeriod)) // 確保結束節次大於等於起始節次
                        .map(p => (
                            <option key={`end-${p}`} value={p}>{p}</option>
                        ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="Major, Elective..." />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-slate-600 ring-2 ring-offset-2 ring-slate-400' : 'border-transparent'}`}
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
              <div className="p-4 rounded-lg text-center mt-4 border border-dashed border-slate-300" style={{ backgroundColor: formData.color }}>
                <span className="font-bold block text-slate-800">{formData.name || 'Course Name'}</span>
                <span className="text-sm opacity-75 text-slate-800">{formData.type}</span>
                <span className="text-xs opacity-75 text-slate-800 block mt-1">{formData.day} P.{formData.startPeriod}-{formData.endPeriod}</span>
              </div>

              <button 
                onClick={handleAddCourse}
                // 當 Grid 模式開啟時，按鈕文字變為確認
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors ${isGridMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <Plus size={20} /> {isGridMode ? 'Confirm Add' : 'Add Course Manually'}
              </button>
            </div>
          </div>

          {/* 下方：課程列表 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Course List ({renderCourseList().length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {renderCourseList().length === 0 ? <p className="text-slate-400 text-center">No courses yet.</p> : renderCourseList()}
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
              <table className="w-full border-collapse min-w-[600px] relative">
                <thead>
                  <tr>
                    <th className="border p-3 bg-slate-50 w-16 sticky top-0 z-10">Period</th>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <th key={day} className="border p-3 bg-blue-600 text-white w-1/5 sticky top-0 z-10">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="relative">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                    <tr key={period} className='h-24'>
                      <td className="border p-3 text-center font-bold text-slate-500 bg-slate-50 h-full align-middle">{period}</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <td 
                            key={`${day}-${period}`} 
                            className="border p-1 h-24 align-top relative cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => handleGridClick(day, period)}
                        >
                            {/* 渲染課程內容，只在每個課程的第一格渲染 */}
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
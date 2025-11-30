import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, BookOpen, Calendar, Clock, X, CheckSquare, Square } from 'lucide-react';
import ConflictModal from './components/ConflictModal';

const App = () => {
  // Helper function to format period range (e.g., [1, 2, 3] -> "1-3")
  // *** 必須先宣告，才能在 useMemo 內使用 ***
  const formatPeriodRange = (periods) => {
    if (periods.length === 0) return '';
    const isContinuous = periods[periods.length - 1] === periods[0] + periods.length - 1;
    if (isContinuous) {
        return periods.length > 1 ? `${periods[0]}-${periods[periods.length - 1]}` : periods[0].toString();
    } else {
        return periods.join(', ');
    }
  };
    
  // 1. Core State: The central pool of all courses (potential or scheduled)
  const [coursePool, setCoursePool] = useState([]); 

  // Form data for new course
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    startPeriod: '1',
    endPeriod: '1',
    type: 'Major',
    color: '#a5b4fc'
  });

  // Conflict Handling State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [pendingGroup, setPendingGroup] = useState(null); 

  // Grid Interaction State
  const [isGridMode, setIsGridMode] = useState(false); 

  // Default Color Palette
  const colorPalette = [
    '#fca5a5', '#fdba74', '#fcd34d', '#86efac', 
    '#93c5fd', '#a5b4fc', '#d8b4fe', '#f0abfc'
  ];

  // Memoized list of currently scheduled courses (filtered from the pool)
  const scheduledCourses = useMemo(() => 
    coursePool.filter(c => c.selected), 
    [coursePool]
  );
  
  // Memoized list of unique course groups for the list view
  const courseGroups = useMemo(() => {
    const groups = {};
    coursePool.forEach(course => {
        const key = `${course.groupId}-${course.day}`;
        if (!groups[key]) {
            groups[key] = {
                groupId: course.groupId,
                name: course.name,
                day: course.day,
                type: course.type,
                color: course.color,
                periods: [],
                selected: course.selected,
            };
        }
        groups[key].periods.push(course.period);
    });
    // Sort periods and format range display
    Object.values(groups).forEach(group => {
        group.periods.sort((a, b) => a - b);
        // 現在 formatPeriodRange 已經在 useMemo 之前被宣告了，所以可以正常存取
        group.periodDisplay = formatPeriodRange(group.periods); 
    });
    return Object.values(groups);
  }, [coursePool]);


  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // 3. Create Course Objects (Handles Multiple Periods and adds Group ID)
  const createCourseObjects = (groupId) => {
    if (!formData.name) return [];
    
    const start = parseInt(formData.startPeriod);
    const end = parseInt(formData.endPeriod);

    if (start > end) {
      alert("Start Period cannot be greater than End Period!");
      return [];
    }

    const newCourses = [];
    for (let period = start; period <= end; period++) {
      newCourses.push({
        id: Date.now() + period,
        groupId: groupId, 
        name: formData.name,
        day: formData.day,
        period: period,
        type: formData.type,
        color: formData.color,
      });
    }
    return newCourses;
  };

  // 4. Add Course to POOL (NOT Schedule)
  const handleAddCourse = () => {
    const groupId = Date.now();
    const newCourses = createCourseObjects(groupId);
    if (newCourses.length === 0) return;

    // Add to pool, default selected: false
    setCoursePool(prev => [...prev, ...newCourses.map(c => ({...c, selected: false}))]);
    setIsGridMode(false); 
    setFormData(prev => ({...prev, name: '', type: 'Major'})); 
  };
  
  // 5. Handle Toggle Schedule (The Checkbox Click - CONFLICT CHECK POINT)
  const handleToggleSchedule = (targetGroupId, targetDay, isSelecting) => {
    
    // 1. Deselecting: Simple update and return
    if (!isSelecting) {
        setCoursePool(prev => prev.map(c => 
            c.groupId === targetGroupId && c.day === targetDay ? {...c, selected: false} : c
        ));
        return;
    }

    // 2. Selecting: Check Conflicts
    const coursesToSchedule = coursePool.filter(c => c.groupId === targetGroupId && c.day === targetDay);
    const conflicts = [];
    
    // Check against all other currently scheduled courses (excluding the one being toggled)
    scheduledCourses.forEach(sc => {
        coursesToSchedule.forEach(newC => {
            if (sc.day === newC.day && sc.period === newC.period) {
                // Conflict found
                conflicts.push({ newCourse: newC, existingCourse: sc });
            }
        });
    });

    if (conflicts.length > 0) {
        // Show Modal, store pending action
        const conflictDetails = conflicts.map(c => 
            `${c.newCourse.day} Period ${c.newCourse.period} (Conflicting with: ${c.existingCourse.name})`
        );
        
        setConflictMessage(
            `The following periods have conflicts:\n${conflictDetails.join('\n')}\n\nDo you want to overwrite these scheduled courses?`
        );
        setPendingGroup(coursesToSchedule);
        setIsModalOpen(true);
    } else {
        // No conflict, schedule directly
        setCoursePool(prev => prev.map(c => 
            c.groupId === targetGroupId && c.day === targetDay ? {...c, selected: true} : c
        ));
    }
  };

  // 6. Confirm Overwrite (Modal Confirm Button)
  const confirmOverride = () => {
    if (!pendingGroup || pendingGroup.length === 0) return;

    let newPool = [...coursePool];
    const targetGroupId = pendingGroup[0].groupId;
    
    // 找出所有與 pendingGroup 衝突的現有課程群組 ID
    const conflictingGroupIds = new Set();
    
    pendingGroup.forEach(pendingC => {
        // 尋找在該時段且目前已選中的衝突課程
        const conflictingCourse = scheduledCourses.find(
            c => c.day === pendingC.day && c.period === pendingC.period && c.groupId !== targetGroupId
        );
        
        if (conflictingCourse) {
            // 將整個衝突課程的群組 ID 記錄下來
            conflictingGroupIds.add(conflictingCourse.groupId);
        }
    });

    // 1. 將所有衝突的課程群組標記為 deselected (整組移除)
    if (conflictingGroupIds.size > 0) {
        newPool = newPool.map(c => {
            if (conflictingGroupIds.has(c.groupId) && c.day === pendingGroup[0].day) {
                return {...c, selected: false};
            }
            return c;
        });
    }

    // 2. 選中 pending course group (加入新的課程群組)
    newPool = newPool.map(c => 
        c.groupId === targetGroupId ? {...c, selected: true} : c
    );
        
    setCoursePool(newPool);
    // Reset state
    setIsModalOpen(false);
    setPendingGroup(null);
  };
  
  // 7. Delete logic for list (Deletes all periods of a specific group)
  const deleteCourseGroup = (targetGroupId, targetDay) => {
    if (window.confirm(`Are you sure you want to delete the course "${courseGroups.find(g => g.groupId === targetGroupId && g.day === targetDay)?.name}" on ${targetDay}?`)) {
        setCoursePool(prevCourses => prevCourses.filter(c => c.groupId !== targetGroupId || c.day !== targetDay));
    }
  };

  // 8. Handle Grid Click (Now only for deletion/interaction with SCHEDULED courses)
  const handleGridClick = (day, period) => {
    const existingCourse = scheduledCourses.find(c => c.day === day && c.period === period);
    
    if (existingCourse) {
        deleteCourseGroup(existingCourse.groupId, existingCourse.day);
    } else {
        // If empty cell is clicked, pre-fill form data for quick add
        setIsGridMode(true);
        setFormData(prev => ({
            ...prev,
            day: day,
            startPeriod: String(period),
            endPeriod: String(period)
        }));
    }
  };


  // 9. Render Schedule Cells 
  const renderCell = (day, period) => {
    const course = scheduledCourses.find(c => c.day === day && c.period === period);

    if (course) {
      // Find the group's duration and start period using the scheduled courses
      const courseGroup = scheduledCourses.filter(c => c.groupId === course.groupId && c.day === course.day);
      const minPeriod = Math.min(...courseGroup.map(c => c.period));
      const duration = courseGroup.length;
      
      const isStart = period === minPeriod;

      if (!isStart) return null;

      return (
        <div 
          style={{ 
            backgroundColor: course.color, 
            color: '#333', 
            height: `${duration * 6.25}rem`, 
          }}
          className={`absolute inset-0 w-full p-2 rounded-md shadow-sm text-sm flex flex-col justify-center items-center text-center cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation(); 
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
  
  const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      {/* Conflict Modal */}
      <ConflictModal 
        isOpen={isModalOpen} 
        message={conflictMessage} 
        onConfirm={confirmOverride} 
        onCancel={() => {
          setIsModalOpen(false);
          setPendingGroup(null);
        }} 
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Course Management System
        </h1>
        <p className="text-slate-500">Manage your courses easily with selection, conflict detection and custom colors</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Edit2 size={20} /> Add New Course to Pool
            </h2>
            
            <div className="space-y-4">
              
              {/* Grid Interaction Tip */}
              <div className='p-3 rounded-lg text-sm font-medium transition-all bg-blue-100 text-blue-800 border border-blue-200'>
                {isGridMode ? (
                    <div className='flex items-center justify-between'>
                        {/* 修復：問號改為打勾 */}
                        <span>? Time selected! Enter details and click **"Add to Pool"**.</span>
                        <X size={18} className='cursor-pointer' onClick={() => setIsGridMode(false)} />
                    </div>
                ) : (
                    /* 修復：問號改為燈泡 */
                    <span>? **Click an empty cell** on the schedule to pre-fill the time.</span>
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
                
                {/* Period Range - Start Period */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Clock size={14} /> From</label>
                  <select name="startPeriod" value={formData.startPeriod} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {periodOptions.map(p => (
                      <option key={`start-${p}`} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                
                {/* Period Range - End Period */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">To</label>
                  <select name="endPeriod" value={formData.endPeriod} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {periodOptions
                        .filter(p => p >= parseInt(formData.startPeriod)) 
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
              
              {/* Preview */}
              <div className="p-4 rounded-lg text-center mt-4 border border-dashed border-slate-300" style={{ backgroundColor: formData.color }}>
                <span className="font-bold block text-slate-800">{formData.name || 'Course Name'}</span>
                <span className="text-sm opacity-75 text-slate-800">{formData.type}</span>
                <span className="text-xs opacity-75 text-slate-800 block mt-1">{formData.day} P.{formData.startPeriod}-{formData.endPeriod}</span>
              </div>

              <button 
                onClick={handleAddCourse}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Plus size={20} /> Add to Pool
              </button>
            </div>
          </div>

          {/* Course List (The Selection Pool) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Selection Pool ({courseGroups.length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {courseGroups.length === 0 ? <p className="text-slate-400 text-center">No courses in pool.</p> : null}
              {courseGroups.map(group => (
                <div key={`${group.groupId}-${group.day}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleToggleSchedule(group.groupId, group.day, !group.selected)}
                        className={`text-2xl p-1 rounded-sm ${group.selected ? 'text-green-600' : 'text-slate-400'}`}
                        title={group.selected ? 'Unschedule' : 'Schedule'}
                    >
                        {group.selected ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <div>
                      <div className="font-bold">{group.name}</div>
                      <div className="text-xs text-slate-500">{group.day} - P. {group.periodDisplay} ({group.type})</div>
                    </div>
                  </div>
                  <button onClick={() => deleteCourseGroup(group.groupId, group.day)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Schedule Grid */}
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
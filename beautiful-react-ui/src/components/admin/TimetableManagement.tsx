import React, { useState, useEffect } from 'react';
import {
  TimetableSlot,
  createTimetableSlot,
  getAllTimetableSlots,
  subscribeToAllTimetableSlots,
  updateTimetableSlot,
  deleteTimetableSlot,
  getAvailableDepartments,
  getAvailableYears,
  testTimetableConnection
} from '../../firebase/realtimeTimetable';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TimetableManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const TimetableManagement: React.FC<TimetableManagementProps> = ({ user, onBack, onLogout }) => {
  const [timeSlots, setTimeSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    teacher: '',
    room: '',
    department: 'Computer Science',
    year: 1,
    semester: 1
  });

  const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronics & Communication'];
  const years = [1, 2, 3, 4];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots_hours = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  // Create mock data for different departments
  const createMockData = async () => {
    const mockSlots = [
      // Computer Science Department
      { day: 'Monday', time: '09:00-10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'CS-101', department: 'Computer Science', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Monday', time: '10:00-11:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'CS-102', department: 'Computer Science', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Tuesday', time: '09:00-10:00', subject: 'Database Systems', teacher: 'Dr. Williams', room: 'CS-103', department: 'Computer Science', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Wednesday', time: '11:00-12:00', subject: 'Software Engineering', teacher: 'Prof. Brown', room: 'CS-104', department: 'Computer Science', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Thursday', time: '14:00-15:00', subject: 'Computer Networks', teacher: 'Dr. Davis', room: 'CS-105', department: 'Computer Science', year: 4, semester: 1, createdBy: user._id, isActive: true },

      // Electrical Engineering Department
      { day: 'Monday', time: '09:00-10:00', subject: 'Circuit Analysis', teacher: 'Dr. Kumar', room: 'EE-201', department: 'Electrical Engineering', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Tuesday', time: '10:00-11:00', subject: 'Digital Electronics', teacher: 'Prof. Sharma', room: 'EE-202', department: 'Electrical Engineering', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Wednesday', time: '14:00-15:00', subject: 'Power Systems', teacher: 'Dr. Patel', room: 'EE-203', department: 'Electrical Engineering', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Thursday', time: '11:00-12:00', subject: 'Control Systems', teacher: 'Prof. Reddy', room: 'EE-204', department: 'Electrical Engineering', year: 3, semester: 1, createdBy: user._id, isActive: true },

      // Mechanical Engineering Department
      { day: 'Monday', time: '11:00-12:00', subject: 'Thermodynamics', teacher: 'Dr. Singh', room: 'ME-301', department: 'Mechanical Engineering', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Tuesday', time: '14:00-15:00', subject: 'Fluid Mechanics', teacher: 'Prof. Gupta', room: 'ME-302', department: 'Mechanical Engineering', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Wednesday', time: '09:00-10:00', subject: 'Machine Design', teacher: 'Dr. Verma', room: 'ME-303', department: 'Mechanical Engineering', year: 4, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Friday', time: '10:00-11:00', subject: 'Manufacturing Processes', teacher: 'Prof. Jain', room: 'ME-304', department: 'Mechanical Engineering', year: 3, semester: 1, createdBy: user._id, isActive: true },

      // Civil Engineering Department
      { day: 'Monday', time: '14:00-15:00', subject: 'Structural Analysis', teacher: 'Dr. Rao', room: 'CE-401', department: 'Civil Engineering', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Tuesday', time: '11:00-12:00', subject: 'Concrete Technology', teacher: 'Prof. Nair', room: 'CE-402', department: 'Civil Engineering', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Thursday', time: '09:00-10:00', subject: 'Geotechnical Engineering', teacher: 'Dr. Iyer', room: 'CE-403', department: 'Civil Engineering', year: 4, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Friday', time: '14:00-15:00', subject: 'Transportation Engineering', teacher: 'Prof. Menon', room: 'CE-404', department: 'Civil Engineering', year: 4, semester: 1, createdBy: user._id, isActive: true },

      // Electronics & Communication Department
      { day: 'Monday', time: '10:00-11:00', subject: 'Analog Electronics', teacher: 'Dr. Krishnan', room: 'EC-501', department: 'Electronics & Communication', year: 2, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Tuesday', time: '09:00-10:00', subject: 'Digital Signal Processing', teacher: 'Prof. Pillai', room: 'EC-502', department: 'Electronics & Communication', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Wednesday', time: '10:00-11:00', subject: 'Microprocessors', teacher: 'Dr. Raman', room: 'EC-503', department: 'Electronics & Communication', year: 3, semester: 1, createdBy: user._id, isActive: true },
      { day: 'Friday', time: '11:00-12:00', subject: 'Communication Systems', teacher: 'Prof. Subramanian', room: 'EC-504', department: 'Electronics & Communication', year: 4, semester: 1, createdBy: user._id, isActive: true }
    ];

    console.log('🔄 Creating mock timetable data...');
    for (const slot of mockSlots) {
      try {
        await createTimetableSlot(slot);
      } catch (error) {
        console.log('Mock data already exists or error creating:', error);
      }
    }
    console.log('✅ Mock data creation completed');
  };

  // Load timetable data and set up real-time subscription
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupTimetableData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Setting up timetable management...');

        // Test connection
        const connectionTest = await testTimetableConnection();
        if (!connectionTest) {
          console.error('❌ Failed to connect to Realtime Database');
          alert('Failed to connect to database. Please try again.');
          return;
        }

        // Create mock data first (only if no data exists)
        const existingSlots = await getAllTimetableSlots();
        if (existingSlots.length === 0) {
          await createMockData();
        }

        // Load available departments and years
        const depts = await getAvailableDepartments();
        if (depts.length > 0) {
          setAvailableDepartments(depts);
        }

        // Set up real-time subscription for all timetable slots
        unsubscribe = subscribeToAllTimetableSlots((slots) => {
          console.log('📊 Received timetable slots update:', slots.length);
          setTimeSlots(slots);
          setLoading(false);
        });

      } catch (error) {
        console.error('❌ Error setting up timetable data:', error);
        setLoading(false);
        alert('Error loading timetable data. Please refresh the page.');
      }
    };

    setupTimetableData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up timetable subscription');
        unsubscribe();
      }
    };
  }, []);

  // Load available years when department changes
  useEffect(() => {
    const loadYears = async () => {
      if (selectedDepartment) {
        try {
          const years = await getAvailableYears(selectedDepartment);
          setAvailableYears(years);
        } catch (error) {
          console.error('❌ Error loading years:', error);
        }
      }
    };

    loadYears();
  }, [selectedDepartment]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const backButtonStyle: React.CSSProperties = {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '1rem'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const buttonStyle: React.CSSProperties = {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const selectStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem'
  };

  const timetableGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `150px repeat(${days.length}, 1fr)`,
    gap: '1px',
    background: '#e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden'
  };

  const cellStyle: React.CSSProperties = {
    background: 'white',
    padding: '1rem',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    background: '#667eea',
    color: 'white',
    fontWeight: '600'
  };

  const timeCellStyle: React.CSSProperties = {
    ...headerCellStyle,
    minWidth: '150px',
    fontSize: '0.9rem',
    textAlign: 'center'
  };

  const timeSlotStyle: React.CSSProperties = {
    background: '#f0f9ff',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    padding: '0.5rem',
    margin: '0.25rem',
    fontSize: '0.75rem',
    textAlign: 'center',
    cursor: 'pointer'
  };

  const availableDepartmentsForFilter = [...new Set(timeSlots.map(slot => slot.department))];
  const availableYearsForFilter = [...new Set(timeSlots.map(slot => slot.year))];

  const filteredTimeSlots = timeSlots.filter(slot => {
    const matchesDepartment = !selectedDepartment || slot.department === selectedDepartment;
    const matchesYear = !selectedYear || slot.year.toString() === selectedYear;
    return matchesDepartment && matchesYear;
  });

  const handleCreateTimeSlot = async () => {
    if (!newTimeSlot.time || !newTimeSlot.subject || !newTimeSlot.teacher || !newTimeSlot.room) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      console.log('🔄 Creating new timetable slot...');

      const slotData = {
        ...newTimeSlot,
        createdBy: user._id,
        isActive: true
      };

      await createTimetableSlot(slotData);

      // Reset form
      setNewTimeSlot({
        day: 'Monday',
        time: '',
        subject: '',
        teacher: '',
        room: '',
        department: 'Computer Science',
        year: 1,
        semester: 1
      });
      setShowCreateForm(false);

      console.log('✅ Timetable slot created successfully');
      alert('Timetable slot created successfully!');
    } catch (error) {
      console.error('❌ Error creating timetable slot:', error);
      alert('Error creating timetable slot. Please try again.');
    }
  };

  const handleEditTimeSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setNewTimeSlot({
      day: slot.day,
      time: slot.time,
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room,
      department: slot.department,
      year: slot.year,
      semester: slot.semester || 1
    });
    setShowCreateForm(true);
  };

  const handleUpdateTimeSlot = async () => {
    if (!editingSlot || !newTimeSlot.time || !newTimeSlot.subject || !newTimeSlot.teacher || !newTimeSlot.room) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      console.log('🔄 Updating timetable slot...');

      const updateData = {
        day: newTimeSlot.day,
        time: newTimeSlot.time,
        subject: newTimeSlot.subject,
        teacher: newTimeSlot.teacher,
        room: newTimeSlot.room,
        department: newTimeSlot.department,
        year: newTimeSlot.year,
        semester: newTimeSlot.semester,
        isActive: true
      };

      await updateTimetableSlot(editingSlot.id!, editingSlot.department, editingSlot.year, updateData);

      // Reset form
      setEditingSlot(null);
      setNewTimeSlot({
        day: 'Monday',
        time: '',
        subject: '',
        teacher: '',
        room: '',
        department: 'Computer Science',
        year: 1,
        semester: 1
      });
      setShowCreateForm(false);

      console.log('✅ Timetable slot updated successfully');
      alert('Timetable slot updated successfully!');
    } catch (error) {
      console.error('❌ Error updating timetable slot:', error);
      alert('Error updating timetable slot. Please try again.');
    }
  };

  const handleDeleteTimeSlot = async (slot: TimetableSlot) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        console.log('🔄 Deleting timetable slot...');
        await deleteTimetableSlot(slot.id!, slot.department, slot.year);
        console.log('✅ Timetable slot deleted successfully');
        alert('Timetable slot deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting timetable slot:', error);
        alert('Error deleting timetable slot. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setNewTimeSlot({
      day: 'Monday',
      time: '',
      subject: '',
      teacher: '',
      room: '',
      department: 'Computer Science',
      year: 1,
      semester: 1
    });
    setShowCreateForm(false);
  };

  const getTimeSlotForCell = (day: string, time: string) => {
    return filteredTimeSlots.filter(slot => slot.day === day && slot.time === time);
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>📅</span>
            Timetable Administration
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main style={mainContentStyle}>
        {loading ? (
          <div style={{
            ...cardStyle,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading timetable data...</p>
            </div>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
                Master Timetable ({filteredTimeSlots.length} classes)
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{ ...buttonStyle, background: '#10b981' }}
                  onClick={async () => {
                    if (window.confirm('This will add sample timetable data for all departments. Continue?')) {
                      setLoading(true);
                      await createMockData();
                      setLoading(false);
                      alert('Sample data added successfully!');
                    }
                  }}
                >
                  📚 Add Sample Data
                </button>
                <button
                  style={buttonStyle}
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? '✕ Cancel' : (editingSlot ? '✕ Cancel Edit' : '+ Add Time Slot')}
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '15px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '2px solid #e2e8f0'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
                  {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
                </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <select
                  style={inputStyle}
                  value={newTimeSlot.day}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, day: e.target.value })}
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                
                <select
                  style={inputStyle}
                  value={newTimeSlot.time}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                >
                  <option value="">Select Time</option>
                  {timeSlots_hours.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Subject Name *"
                  value={newTimeSlot.subject}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, subject: e.target.value })}
                />
                
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Teacher Name *"
                  value={newTimeSlot.teacher}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, teacher: e.target.value })}
                />
                
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Room Number *"
                  value={newTimeSlot.room}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, room: e.target.value })}
                />
                
                <select
                  style={inputStyle}
                  value={newTimeSlot.department}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, department: e.target.value })}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <select
                  style={inputStyle}
                  value={newTimeSlot.year}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, year: parseInt(e.target.value) })}
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>

                <select
                  style={inputStyle}
                  value={newTimeSlot.semester}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, semester: parseInt(e.target.value) })}
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  style={buttonStyle}
                  onClick={editingSlot ? handleUpdateTimeSlot : handleCreateTimeSlot}
                >
                  {editingSlot ? '✏️ Update Time Slot' : '📅 Add Time Slot'}
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '15px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.2rem' }}>🔍 Filter Timetable</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Department:
                </label>
                <select
                  style={selectStyle}
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments ({departments.length} total)</option>
                  {departments.map(dept => {
                    const count = timeSlots.filter(slot => slot.department === dept).length;
                    return (
                      <option key={dept} value={dept}>{dept} ({count} classes)</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Year of Study:
                </label>
                <select
                  style={selectStyle}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map(year => {
                    const count = timeSlots.filter(slot => slot.year === year).length;
                    return (
                      <option key={year} value={year}>Year {year} ({count} classes)</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {(selectedDepartment || selectedYear) && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#e0f2fe',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#0369a1'
              }}>
                📊 Showing {filteredTimeSlots.length} classes
                {selectedDepartment && ` from ${selectedDepartment}`}
                {selectedYear && ` for Year ${selectedYear}`}
                <button
                  style={{
                    marginLeft: '1rem',
                    padding: '0.25rem 0.75rem',
                    background: '#0369a1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedYear('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={timetableGridStyle}>
              {/* Header row */}
              <div style={timeCellStyle}>Time</div>
              {days.map(day => (
                <div key={day} style={headerCellStyle}>{day}</div>
              ))}

              {/* Time slots */}
              {timeSlots_hours.map(time => (
                <React.Fragment key={time}>
                  <div style={timeCellStyle}>{time}</div>
                  {days.map(day => (
                    <div key={`${day}-${time}`} style={cellStyle}>
                      {getTimeSlotForCell(day, time).map(slot => (
                        <div
                          key={slot.id}
                          style={{
                            ...timeSlotStyle,
                            position: 'relative',
                            cursor: 'default'
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {slot.subject}
                          </div>
                          <div>{slot.teacher}</div>
                          <div>{slot.room}</div>
                          <div style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                            {slot.department} - Year {slot.year}
                            {slot.semester && ` - Sem ${slot.semester}`}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '0.25rem',
                            marginTop: '0.5rem',
                            justifyContent: 'center'
                          }}>
                            <button
                              style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTimeSlot(slot);
                              }}
                              title="Edit time slot"
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTimeSlot(slot);
                              }}
                              title="Delete time slot"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem' }}>
                💡 <strong>Tip:</strong> Use the Edit and Delete buttons on each time slot to manage the timetable. Use the filters above to view specific department or year timetables. All changes are saved in real-time to Firebase.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TimetableManagement;

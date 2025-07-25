import React, { useState } from 'react';

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  department: string;
  year: number;
}

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Monday', time: '09:00-10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'CS-101', department: 'Computer Science', year: 2 },
    { id: '2', day: 'Monday', time: '10:00-11:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'CS-102', department: 'Computer Science', year: 2 },
    { id: '3', day: 'Tuesday', time: '09:00-10:00', subject: 'Database Systems', teacher: 'Dr. Williams', room: 'CS-103', department: 'Computer Science', year: 3 },
    { id: '4', day: 'Wednesday', time: '11:00-12:00', subject: 'Circuit Analysis', teacher: 'Prof. Brown', room: 'EE-201', department: 'Electrical Engineering', year: 2 },
    { id: '5', day: 'Thursday', time: '14:00-15:00', subject: 'Thermodynamics', teacher: 'Dr. Davis', room: 'ME-301', department: 'Mechanical Engineering', year: 3 },
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    teacher: '',
    room: '',
    department: 'Computer Science',
    year: 1
  });

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
    gridTemplateColumns: 'auto repeat(7, 1fr)',
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots_hours = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const departments = [...new Set(timeSlots.map(slot => slot.department))];
  const years = [...new Set(timeSlots.map(slot => slot.year))];

  const filteredTimeSlots = timeSlots.filter(slot => {
    const matchesDepartment = !selectedDepartment || slot.department === selectedDepartment;
    const matchesYear = !selectedYear || slot.year.toString() === selectedYear;
    return matchesDepartment && matchesYear;
  });

  const handleCreateTimeSlot = () => {
    if (!newTimeSlot.time || !newTimeSlot.subject || !newTimeSlot.teacher || !newTimeSlot.room) {
      alert('Please fill in all required fields');
      return;
    }

    const timeSlot: TimeSlot = {
      id: Date.now().toString(),
      ...newTimeSlot
    };

    setTimeSlots([...timeSlots, timeSlot]);
    setNewTimeSlot({
      day: 'Monday',
      time: '',
      subject: '',
      teacher: '',
      room: '',
      department: 'Computer Science',
      year: 1
    });
    setShowCreateForm(false);
  };

  const handleDeleteTimeSlot = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    }
  };

  const getTimeSlotForCell = (day: string, time: string) => {
    return filteredTimeSlots.filter(slot => slot.day === day && slot.time === time);
  };

  return (
    <div style={containerStyle}>
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
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              Master Timetable ({filteredTimeSlots.length} classes)
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '✕ Cancel' : '+ Add Time Slot'}
            </button>
          </div>

          {showCreateForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>Add New Time Slot</h3>
              
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
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
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
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={buttonStyle} onClick={handleCreateTimeSlot}>
                  📅 Add Time Slot
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Filter Timetable:</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                style={selectStyle}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                style={selectStyle}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={timetableGridStyle}>
              {/* Header row */}
              <div style={headerCellStyle}>Time</div>
              {days.map(day => (
                <div key={day} style={headerCellStyle}>{day}</div>
              ))}
              
              {/* Time slots */}
              {timeSlots_hours.map(time => (
                <React.Fragment key={time}>
                  <div style={headerCellStyle}>{time}</div>
                  {days.map(day => (
                    <div key={`${day}-${time}`} style={cellStyle}>
                      {getTimeSlotForCell(day, time).map(slot => (
                        <div
                          key={slot.id}
                          style={timeSlotStyle}
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          title="Click to delete"
                        >
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {slot.subject}
                          </div>
                          <div>{slot.teacher}</div>
                          <div>{slot.room}</div>
                          <div style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                            {slot.department} - Year {slot.year}
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
              💡 <strong>Tip:</strong> Click on any time slot in the timetable to delete it. Use the filters above to view specific department or year timetables.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimetableManagement;

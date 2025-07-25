import React, { useState } from 'react';

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
}

interface StudentTimetableProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const StudentTimetable: React.FC<StudentTimetableProps> = ({ user, onBack, onLogout }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Monday', time: '09:00-10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'CS-101' },
    { id: '2', day: 'Monday', time: '10:00-11:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'CS-102' },
    { id: '3', day: 'Tuesday', time: '09:00-10:00', subject: 'Database Systems', teacher: 'Dr. Williams', room: 'CS-103' },
    { id: '4', day: 'Wednesday', time: '11:00-12:00', subject: 'Software Engineering', teacher: 'Prof. Brown', room: 'CS-104' },
    { id: '5', day: 'Thursday', time: '14:00-15:00', subject: 'Computer Networks', teacher: 'Dr. Davis', room: 'CS-105' },
    { id: '6', day: 'Friday', time: '10:00-11:00', subject: 'Machine Learning', teacher: 'Prof. Wilson', room: 'CS-106' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    teacher: '',
    room: ''
  });

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
    cursor: 'pointer',
    position: 'relative'
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots_hours = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.time || !newTimeSlot.subject || !newTimeSlot.teacher || !newTimeSlot.room) {
      alert('Please fill in all required fields');
      return;
    }

    const timeSlot: TimeSlot = {
      id: Date.now().toString(),
      ...newTimeSlot
    };

    setTimeSlots([...timeSlots, timeSlot]);
    setNewTimeSlot({ day: 'Monday', time: '', subject: '', teacher: '', room: '' });
    setShowAddForm(false);
  };

  const handleDeleteTimeSlot = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    }
  };

  const getTimeSlotForCell = (day: string, time: string) => {
    return timeSlots.filter(slot => slot.day === day && slot.time === time);
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
            My Timetable
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
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
              Weekly Schedule ({timeSlots.length} classes)
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '✕ Cancel' : '+ Add Class'}
            </button>
          </div>

          {showAddForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>Add New Class</h3>
              
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
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={buttonStyle} onClick={handleAddTimeSlot}>
                  📅 Add Class
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
              💡 <strong>Tip:</strong> Click on any class in the timetable to delete it. Use the "Add Class" button to add new classes to your schedule.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Weekly Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#3b82f6' }}>{timeSlots.length}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Total Classes</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#10b981' }}>{new Set(timeSlots.map(s => s.day)).size}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Active Days</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#d97706' }}>{new Set(timeSlots.map(s => s.subject)).size}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Subjects</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fce7f3', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#be185d' }}>{new Set(timeSlots.map(s => s.teacher)).size}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Teachers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentTimetable;

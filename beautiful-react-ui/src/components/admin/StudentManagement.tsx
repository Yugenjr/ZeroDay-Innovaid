import React, { useState } from 'react';
import { AppUser } from '../../firebase/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface StudentManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  students: AppUser[];
  loading?: boolean;
  onRefresh?: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ user, onBack, onLogout, students, loading = false, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AppUser | null>(null);

  // Debug logging - track prop changes
  React.useEffect(() => {
    console.log('🎯 StudentManagement: Props updated!');
    console.log(`📊 Student count: ${students.length}`);
    console.log(`⏳ Loading: ${loading}`);
    console.log('👥 Students:', students.map(s => `${s.name} (${s.email})`).join(', '));
  }, [students, loading]);

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

  const filterStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem'
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  };

  const thStyle: React.CSSProperties = {
    background: '#667eea',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600'
  };

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0'
  };



  const actionButtonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    margin: '0 0.25rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600'
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    const matchesYear = !filterYear || (student.year && student.year.toString() === filterYear);

    return matchesSearch && matchesDepartment && matchesYear;
  });

  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  const years = [...new Set(students.map(s => s.year).filter(Boolean).map(y => y!.toString()))];

  const handleViewDetails = (student: AppUser) => {
    setSelectedStudent(student);
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>👥</span>
            Student Management
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0', color: '#333', fontSize: '1.5rem' }}>
              Student Database ({filteredStudents.length} students)
            </h2>
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                🔄 Refresh Data
              </button>
            )}
          </div>
          
          <div style={filterStyle}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              style={inputStyle}
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              style={inputStyle}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Student ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '2rem' }}>
                      <div style={{ color: '#666' }}>Loading students...</div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '2rem' }}>
                      <div style={{ color: '#666' }}>
                        {students.length === 0 ? 'No students registered yet.' : 'No students match your search criteria.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.uid}>
                      <td style={tdStyle}>{student.studentId || 'N/A'}</td>
                      <td style={tdStyle}>{student.name}</td>
                      <td style={tdStyle}>{student.email}</td>
                      <td style={tdStyle}>{student.department || 'N/A'}</td>
                      <td style={tdStyle}>{student.year ? `Year ${student.year}` : 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: student.role === 'admin' ? '#fef3c7' : '#dbeafe',
                          color: student.role === 'admin' ? '#92400e' : '#1e40af'
                        }}>
                          {student.role === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td style={tdStyle}>{student.createdAt.toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <button
                          style={{ ...actionButtonStyle, background: '#3b82f6', color: 'white' }}
                          onClick={() => handleViewDetails(student)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStudent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Student Details</h3>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Name:</strong> {selectedStudent.name}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Student ID:</strong> {selectedStudent.studentId || 'Not provided'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong> {selectedStudent.email}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Department:</strong> {selectedStudent.department || 'Not specified'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Year:</strong> {selectedStudent.year || 'Not specified'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Role:</strong>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: selectedStudent.role === 'admin' ? '#fef3c7' : '#dbeafe',
                  color: selectedStudent.role === 'admin' ? '#92400e' : '#1e40af',
                  marginLeft: '0.5rem'
                }}>
                  {selectedStudent.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <strong>Joined:</strong> {selectedStudent.createdAt.toLocaleDateString()}
              </div>
              <button
                style={{ ...actionButtonStyle, background: '#6b7280', color: 'white', width: '100%' }}
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentManagement;

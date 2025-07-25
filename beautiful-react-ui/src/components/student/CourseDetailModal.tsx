import React from 'react';
// @ts-ignore
import { SkillCourse } from '../../firebase/skillExchange';

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

interface CourseDetailModalProps {
  course: SkillCourse;
  user: User;
  onClose: () => void;
  onRegister: (courseId: string) => void;
  isRegistered: boolean;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ 
  course, 
  user, 
  onClose, 
  onRegister, 
  isRegistered 
}) => {
  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if registration deadline has passed
  const isRegistrationOpen = (deadline: string) => {
    return new Date() <= new Date(deadline);
  };

  // Get course status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'ongoing': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Calculate time until course starts
  const getTimeUntilCourse = () => {
    const now = new Date();
    const courseDate = new Date(course.dateTime);
    const diffMs = courseDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Course has started or ended';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const modalStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    marginRight: '1rem'
  };

  const sectionStyle: React.CSSProperties = {
    background: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0, color: '#333', fontSize: '1.8rem' }}>
                {course.title}
              </h1>
              <span style={{
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: getStatusColor(course.status)
              }}>
                {course.status.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1rem' }}>
              by <strong>{course.instructorName}</strong> • {course.instructorDepartment} • Year {course.instructorYear}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(course.techStack || []).map((tech, index) => (
                <span
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Course Description */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
            📝 Course Description
          </h3>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
            {course.description}
          </p>
        </div>

        {/* Course Details */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
            📋 Course Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#374151' }}>📅 Date & Time:</strong><br />
              <span style={{ color: '#6b7280' }}>{formatDateTime(course.dateTime)}</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>⏱️ Duration:</strong><br />
              <span style={{ color: '#6b7280' }}>{course.duration} minutes</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>👥 Capacity:</strong><br />
              <span style={{ color: '#6b7280' }}>
                {(course.registeredStudents || []).length} / {course.maxLearners} students
              </span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>📂 Category:</strong><br />
              <span style={{ color: '#6b7280' }}>{course.category}</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>📋 Registration Deadline:</strong><br />
              <span style={{ 
                color: isRegistrationOpen(course.registrationDeadline) ? '#059669' : '#dc2626' 
              }}>
                {new Date(course.registrationDeadline).toLocaleString()}
              </span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>⏰ Time Until Course:</strong><br />
              <span style={{ color: '#6b7280' }}>{getTimeUntilCourse()}</span>
            </div>
          </div>
        </div>

        {/* Instructor Information */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
            👨‍🏫 Instructor Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#374151' }}>Name:</strong><br />
              <span style={{ color: '#6b7280' }}>{course.instructorName}</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Department:</strong><br />
              <span style={{ color: '#6b7280' }}>{course.instructorDepartment}</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Year:</strong><br />
              <span style={{ color: '#6b7280' }}>Year {course.instructorYear}</span>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Email:</strong><br />
              <a href={`mailto:${course.instructorEmail}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                {course.instructorEmail}
              </a>
            </div>
            {course.instructorPhone && (
              <div>
                <strong style={{ color: '#374151' }}>Phone:</strong><br />
                <span style={{ color: '#6b7280' }}>{course.instructorPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        {course.prerequisites && (
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
              📚 Prerequisites
            </h3>
            <p style={{ margin: 0, color: '#4b5563' }}>
              {course.prerequisites}
            </p>
          </div>
        )}

        {/* Learning Outcomes */}
        {course.learningOutcomes && (course.learningOutcomes || []).length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
              🎯 Learning Outcomes
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#4b5563' }}>
              {(course.learningOutcomes || []).map((outcome, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Promo Video */}
        {course.promoVideoUrl && (
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
              🎥 Course Preview
            </h3>
            <video 
              controls 
              style={{ 
                width: '100%', 
                maxHeight: '400px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <source src={course.promoVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Meeting Link */}
        {(isRegistered || course.instructorId === (user.studentId || user._id)) && (
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
              🔗 Meeting Link
            </h3>
            <div style={{ 
              background: '#e0f2fe', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid #b3e5fc' 
            }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#0277bd', fontWeight: 'bold' }}>
                Google Meet Link:
              </p>
              <a 
                href={course.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#1976d2', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  wordBreak: 'break-all'
                }}
              >
                {course.meetLink}
              </a>
              <p style={{ margin: '0.5rem 0 0 0', color: '#0277bd', fontSize: '0.9rem' }}>
                💡 Save this link! You'll need it to join the course on {new Date(course.dateTime).toLocaleDateString()}.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          {course.instructorId !== (user.studentId || user._id) && (
            <>
              {isRegistered ? (
                <div style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  border: '2px solid #a7f3d0'
                }}>
                  ✅ You're Registered!
                </div>
              ) : isRegistrationOpen(course.registrationDeadline) &&
                 (course.registeredStudents || []).length < course.maxLearners ? (
                <button
                  style={buttonStyle}
                  onClick={() => onRegister(course.id!)}
                >
                  🚀 Register for Course
                </button>
              ) : (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  border: '2px solid #fecaca'
                }}>
                  {(course.registeredStudents || []).length >= course.maxLearners ?
                    '❌ Course Full' :
                    '❌ Registration Closed'
                  }
                </div>
              )}
            </>
          )}
          
          <button
            style={{ ...buttonStyle, background: '#6b7280' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;

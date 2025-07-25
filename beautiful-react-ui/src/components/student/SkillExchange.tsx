import React, { useState, useEffect } from 'react';
// @ts-ignore
import { getAllSkillCourses, getCoursesByInstructor, registerForCourse, getStudentRegistrations, SkillCourse, CourseRegistration } from '../../firebase/skillExchange';
import CreateCourseForm from './CreateCourseForm';
import CourseDetailModal from './CourseDetailModal';

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

interface SkillExchangeProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const SkillExchange: React.FC<SkillExchangeProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [courses, setCourses] = useState<SkillCourse[]>([]);
  const [myCourses, setMyCourses] = useState<SkillCourse[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'my-courses' | 'my-registrations'>('browse');
  const [selectedCourse, setSelectedCourse] = useState<SkillCourse | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all courses
      const coursesResult = await getAllSkillCourses();
      if (coursesResult.success) {
        setCourses(coursesResult.courses);
      }

      // Load instructor's courses
      const studentId = user.studentId || user._id;
      if (studentId) {
        const myCoursesResult = await getCoursesByInstructor(studentId);
        if (myCoursesResult.success) {
          setMyCourses(myCoursesResult.courses);
        }

        // Load student's registrations
        const registrationsResult = await getStudentRegistrations(studentId);
        if (registrationsResult.success) {
          setMyRegistrations(registrationsResult.registrations);
        }
      }
    } catch (error) {
      console.error('Error loading skill exchange data:', error);
      setMessage('❌ Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle course registration
  const handleRegisterForCourse = async (courseId: string) => {
    // Validate user data
    if (!user) {
      setMessage('❌ User not found. Please login again.');
      return;
    }

    if (!user.studentId && !user._id) {
      setMessage('❌ Student ID not found. Please contact support.');
      return;
    }

    if (!user.name || !user.email) {
      setMessage('❌ User information incomplete. Please update your profile.');
      return;
    }

    try {
      // Use studentId if available, otherwise use _id
      const studentId = user.studentId || user._id;

      const result = await registerForCourse(courseId, {
        studentId: studentId,
        studentName: user.name,
        studentEmail: user.email
      });

      if (result.success) {
        setMessage('✅ Successfully registered for the course!');
        loadData(); // Refresh data
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error registering for course:', error);
      setMessage('❌ Failed to register for course. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

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

  // Check if student is already registered
  const isStudentRegistered = (course: SkillCourse) => {
    if (!user || !course.registeredStudents) return false;
    const studentId = user.studentId || user._id;
    return course.registeredStudents.includes(studentId);
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

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    transition: 'background 0.3s ease'
  };

  const headerStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(30, 30, 60, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.3s ease'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(42, 42, 74, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    marginBottom: '2rem',
    transition: 'background 0.3s ease'
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    background: isActive ? '#667eea' : 'transparent',
    color: isActive ? 'white' : '#667eea',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '1rem',
    transition: 'all 0.3s ease'
  });

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  };

  const courseCardStyle: React.CSSProperties = {
    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: `1px solid ${isDarkMode ? '#555' : '#e5e7eb'}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            style={{ ...buttonStyle, background: '#6b7280' }}
            onClick={onBack}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
            🎓 Skill Exchange Marketplace
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>Welcome, {user.name}</span>
          <button style={buttonStyle} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={mainContentStyle}>
        {/* Message Display */}
        {message && (
          <div style={{
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <div style={cardStyle}>
          {/* Tab Navigation */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <button
                style={tabStyle(activeTab === 'browse')}
                onClick={() => setActiveTab('browse')}
              >
                🔍 Browse Courses
              </button>
              <button
                style={tabStyle(activeTab === 'my-courses')}
                onClick={() => setActiveTab('my-courses')}
              >
                📚 My Courses ({myCourses.length})
              </button>
              <button
                style={tabStyle(activeTab === 'my-registrations')}
                onClick={() => setActiveTab('my-registrations')}
              >
                📝 My Registrations ({myRegistrations.length})
              </button>
            </div>
            <button
              style={buttonStyle}
              onClick={() => setShowCreateForm(true)}
            >
              + Create Course
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.2rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>Loading courses...</div>
            </div>
          ) : (
            <>
              {/* Browse Courses Tab */}
              {activeTab === 'browse' && (
                <div>
                  <h2 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
                    Available Courses ({courses.length})
                  </h2>
                  
                  {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                      No courses available yet. Be the first to create one!
                    </div>
                  ) : (
                    <div>
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          style={courseCardStyle}
                          onClick={() => setSelectedCourse(course)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ margin: '0 0 0.5rem 0', color: isDarkMode ? '#fff' : '#333', fontSize: '1.2rem', transition: 'color 0.3s ease' }}>
                                {course.title}
                              </h3>
                              <p style={{ margin: '0 0 0.5rem 0', color: isDarkMode ? '#ccc' : '#666', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>
                                by {course.instructorName} • {course.instructorDepartment} • Year {course.instructorYear}
                              </p>
                            </div>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: 'white',
                              backgroundColor: getStatusColor(course.status)
                            }}>
                              {course.status.toUpperCase()}
                            </span>
                          </div>

                          <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
                            {course.description}
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {(course.techStack || []).map((tech, index) => (
                              <span
                                key={index}
                                style={{
                                  background: '#e5e7eb',
                                  color: '#374151',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <strong>📅 Date & Time:</strong><br />
                              <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                {formatDateTime(course.dateTime)}
                              </span>
                            </div>
                            <div>
                              <strong>⏱️ Duration:</strong><br />
                              <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                {course.duration} minutes
                              </span>
                            </div>
                            <div>
                              <strong>👥 Capacity:</strong><br />
                              <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                {(course.registeredStudents || []).length} / {course.maxLearners} students
                              </span>
                            </div>
                            <div>
                              <strong>📋 Registration Deadline:</strong><br />
                              <span style={{ 
                                fontSize: '0.9rem', 
                                color: isRegistrationOpen(course.registrationDeadline) ? '#059669' : '#dc2626' 
                              }}>
                                {new Date(course.registrationDeadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                              Category: <strong>{course.category}</strong>
                            </div>
                            
                            {course.instructorId !== (user.studentId || user._id) && (
                              <div>
                                {isStudentRegistered(course) ? (
                                  <span style={{
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ✅ Registered
                                  </span>
                                ) : isRegistrationOpen(course.registrationDeadline) &&
                                   (course.registeredStudents || []).length < course.maxLearners ? (
                                  <button
                                    style={{
                                      ...buttonStyle,
                                      fontSize: '0.9rem',
                                      padding: '0.5rem 1rem'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRegisterForCourse(course.id!);
                                    }}
                                  >
                                    Register Now
                                  </button>
                                ) : (
                                  <span style={{
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {(course.registeredStudents || []).length >= course.maxLearners ? 'Full' : 'Registration Closed'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Courses Tab */}
              {activeTab === 'my-courses' && (
                <div>
                  <h2 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
                    My Created Courses ({myCourses.length})
                  </h2>
                  
                  {myCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                      You haven't created any courses yet. Click "Create Course" to get started!
                    </div>
                  ) : (
                    <div>
                      {myCourses.map((course) => (
                        <div key={course.id} style={courseCardStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ margin: '0', color: isDarkMode ? '#fff' : '#333', fontSize: '1.2rem', transition: 'color 0.3s ease' }}>
                              {course.title}
                            </h3>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: 'white',
                              backgroundColor: getStatusColor(course.status)
                            }}>
                              {course.status.toUpperCase()}
                            </span>
                          </div>

                          <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
                            {course.description}
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <strong>📅 Date & Time:</strong><br />
                              <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                {formatDateTime(course.dateTime)}
                              </span>
                            </div>
                            <div>
                              <strong>👥 Registered:</strong><br />
                              <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                {(course.registeredStudents || []).length} / {course.maxLearners} students
                              </span>
                            </div>
                            <div>
                              <strong>🔗 Meet Link:</strong><br />
                              <a 
                                href={course.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.9rem', color: '#3b82f6', textDecoration: 'none' }}
                              >
                                Join Meeting
                              </a>
                            </div>
                          </div>

                          {course.promoVideoUrl && (
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>🎥 Promo Video:</strong><br />
                              <video 
                                controls 
                                style={{ width: '100%', maxWidth: '400px', height: '200px', borderRadius: '8px' }}
                              >
                                <source src={course.promoVideoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Registrations Tab */}
              {activeTab === 'my-registrations' && (
                <div>
                  <h2 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
                    My Course Registrations ({myRegistrations.length})
                  </h2>
                  
                  {myRegistrations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                      You haven't registered for any courses yet. Browse available courses to get started!
                    </div>
                  ) : (
                    <div>
                      {myRegistrations.map((registration) => {
                        const course = courses.find(c => c.id === registration.courseId);
                        return (
                          <div key={registration.id} style={courseCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <h3 style={{ margin: '0', color: isDarkMode ? '#fff' : '#333', fontSize: '1.2rem', transition: 'color 0.3s ease' }}>
                                {registration.courseTitle}
                              </h3>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: registration.status === 'registered' ? '#3b82f6' : 
                                                registration.status === 'attended' ? '#10b981' : '#6b7280'
                              }}>
                                {registration.status.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                              <div>
                                <strong>📅 Registered On:</strong><br />
                                <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                  {new Date(registration.registrationDate).toLocaleDateString()}
                                </span>
                              </div>
                              {course && (
                                <>
                                  <div>
                                    <strong>📅 Course Date:</strong><br />
                                    <span style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', transition: 'color 0.3s ease' }}>
                                      {formatDateTime(course.dateTime)}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>🔗 Meet Link:</strong><br />
                                    <a 
                                      href={course.meetLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={{ fontSize: '0.9rem', color: '#3b82f6', textDecoration: 'none' }}
                                    >
                                      Join Meeting
                                    </a>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Course Form Modal */}
      {showCreateForm && (
        <CreateCourseForm
          user={user}
          onClose={() => setShowCreateForm(false)}
          onSuccess={loadData}
        />
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          user={user}
          onClose={() => setSelectedCourse(null)}
          onRegister={handleRegisterForCourse}
          isRegistered={isStudentRegistered(selectedCourse)}
        />
      )}
    </div>
  );
};

export default SkillExchange;

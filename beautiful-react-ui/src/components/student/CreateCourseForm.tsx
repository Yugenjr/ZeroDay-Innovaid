import React, { useState } from 'react';
// @ts-ignore
import { createSkillCourse, uploadPromoVideo } from '../../firebase/skillExchange';

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

interface CreateCourseFormProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    category: 'Programming',
    dateTime: '',
    duration: 60,
    maxLearners: 10,
    registrationDeadline: '',
    meetLink: '',
    prerequisites: '',
    learningOutcomes: ''
  });
  const [promoVideo, setPromoVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Languages',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Art',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setMessage('❌ Please select a valid video file');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setMessage('❌ Video file is too large. Maximum size is 50MB.');
        return;
      }
      
      setPromoVideo(file);
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentId = user.studentId || user._id;
    if (!studentId) {
      setMessage('❌ Student ID not found');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.techStack || 
        !formData.dateTime || !formData.registrationDeadline || !formData.meetLink) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    // Validate dates
    const courseDate = new Date(formData.dateTime);
    const deadlineDate = new Date(formData.registrationDeadline);
    const now = new Date();

    if (courseDate <= now) {
      setMessage('❌ Course date must be in the future');
      return;
    }

    if (deadlineDate >= courseDate) {
      setMessage('❌ Registration deadline must be before the course date');
      return;
    }

    if (deadlineDate <= now) {
      setMessage('❌ Registration deadline must be in the future');
      return;
    }

    // Validate Google Meet link
    if (!formData.meetLink.includes('meet.google.com')) {
      setMessage('❌ Please provide a valid Google Meet link');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Prepare course data
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        techStack: formData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech),
        category: formData.category,
        instructorId: studentId,
        instructorName: user.name,
        instructorEmail: user.email,
        instructorDepartment: user.department,
        instructorYear: user.year,
        instructorPhone: user.phone,
        dateTime: formData.dateTime,
        duration: formData.duration,
        maxLearners: formData.maxLearners,
        registrationDeadline: formData.registrationDeadline,
        meetLink: formData.meetLink.trim(),
        status: 'upcoming' as const,
        prerequisites: formData.prerequisites.trim(),
        learningOutcomes: formData.learningOutcomes ?
          formData.learningOutcomes.split('\n').map(outcome => outcome.trim()).filter(outcome => outcome) :
          undefined
      };

      // Create course
      const result = await createSkillCourse(courseData);
      
      if (result.success && result.courseId) {
        // Upload promo video if provided
        if (promoVideo) {
          setMessage('✅ Course created! Uploading promo video...');
          const videoResult = await uploadPromoVideo(result.courseId, promoVideo);
          
          if (videoResult.success) {
            setMessage('✅ Course created successfully with promo video!');
          } else {
            setMessage('✅ Course created successfully, but video upload failed. You can add it later.');
          }
        } else {
          setMessage('✅ Course created successfully!');
        }
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setMessage('❌ Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const formStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem',
    transition: 'border-color 0.3s ease'
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Create New Course</h2>
          <button
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., React.js Fundamentals"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn in this course..."
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Tech Stack/Skills *
              </label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleInputChange}
                placeholder="React, JavaScript, CSS (comma separated)"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Course Date & Time *
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="15"
                max="480"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Max Learners *
              </label>
              <input
                type="number"
                name="maxLearners"
                value={formData.maxLearners}
                onChange={handleInputChange}
                min="1"
                max="100"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Google Meet Link *
            </label>
            <input
              type="url"
              name="meetLink"
              value={formData.meetLink}
              onChange={handleInputChange}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Prerequisites (Optional)
            </label>
            <input
              type="text"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleInputChange}
              placeholder="Basic JavaScript knowledge, HTML/CSS"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Learning Outcomes (Optional)
            </label>
            <textarea
              name="learningOutcomes"
              value={formData.learningOutcomes}
              onChange={handleInputChange}
              placeholder="Enter each learning outcome on a new line..."
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Promo Video (Optional)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={inputStyle}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Max file size: 50MB. Supported formats: MP4, MOV, AVI, etc.
            </small>
            {promoVideo && (
              <div style={{ marginTop: '0.5rem', color: '#059669', fontSize: '0.875rem' }}>
                ✅ Video selected: {promoVideo.name}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{ ...buttonStyle, background: '#6b7280' }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
              disabled={submitting}
            >
              {submitting ? '⏳ Creating...' : '🚀 Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseForm;

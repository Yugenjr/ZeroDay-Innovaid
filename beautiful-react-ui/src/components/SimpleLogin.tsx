import React, { useState } from 'react';
// @ts-ignore
import { registerUser, loginUser, AppUser } from '../firebase/auth';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

interface LoginFormData {
  name?: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
}



const SimpleLogin: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
      role: selectedRole
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login with Firebase
        const result = await loginUser(formData.email, formData.password);

        if (result.success && result.user) {
          setMessage(`✅ Login successful! Welcome ${result.user.name}!`);
          localStorage.setItem('user', JSON.stringify(result.user));
          setCurrentUser(result.user);
        } else {
          setMessage(`❌ Error: ${result.message}`);
        }
      } else {
        // Register with Firebase
        if (!formData.name) {
          setMessage('❌ Error: Name is required for registration');
          return;
        }

        const userData = {
          name: formData.name,
          role: formData.role as 'user' | 'admin',
          studentId: formData.studentId,
          department: formData.department,
          year: formData.year ? parseInt(formData.year.toString()) : undefined,
          phone: formData.phone
        };

        const result = await registerUser(formData.email, formData.password, userData);

        if (result.success && result.user) {
          setMessage(`✅ Registration successful! Welcome ${result.user.name}!`);
          localStorage.setItem('user', JSON.stringify(result.user));
          setCurrentUser(result.user);
        } else {
          setMessage(`❌ Error: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage('❌ Authentication error: Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // @ts-ignore
      const { logoutUser } = await import('../firebase/auth');
      const result = await logoutUser();

      if (result.success) {
        localStorage.removeItem('user');
        setCurrentUser(null);
        setMessage('✅ Logged out successfully!');
        setFormData({ email: '', password: '', role: selectedRole });
      } else {
        setMessage(`❌ Logout error: ${result.message}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      localStorage.removeItem('user');
      setCurrentUser(null);
      setMessage('✅ Logged out successfully!');
      setFormData({ email: '', password: '', role: selectedRole });
    }
  };

  // Check if user is logged in on component mount and set up Firebase auth listener
  React.useEffect(() => {
    const setupAuthListener = async () => {
      try {
        // @ts-ignore
        const { auth } = await import('../firebase/config');
        // @ts-ignore
        const { onAuthStateChanged } = await import('firebase/auth');
        // @ts-ignore
        const { getCurrentUserData } = await import('../firebase/auth');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in
            const userData = await getCurrentUserData(firebaseUser);
            if (userData) {
              setCurrentUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } else {
            // User is signed out
            setCurrentUser(null);
            localStorage.removeItem('user');
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        // Fallback to localStorage check
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setCurrentUser(user);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
          }
        }
      }
    };

    setupAuthListener();
  }, []);

  // If user is logged in, show appropriate dashboard
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    } else {
      return <UserDashboard user={currentUser} onLogout={handleLogout} />;
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '2rem'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem'
  };

  const roleButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '1rem',
    border: active ? '2px solid #667eea' : '2px solid #ddd',
    borderRadius: '10px',
    background: active ? '#667eea' : 'white',
    color: active ? 'white' : '#666',
    cursor: 'pointer',
    fontWeight: '600',
    margin: '0 0.5rem'
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1
  };

  const messageStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '10px',
    marginTop: '1rem',
    background: message.includes('✅') ? '#d4edda' : '#f8d7da',
    color: message.includes('✅') ? '#155724' : '#721c24',
    border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🎓
          </div>
          <h1 style={titleStyle}>InnovAid</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Campus Utilities Platform</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '2rem' }}>
          <button
            style={roleButtonStyle(selectedRole === 'user')}
            onClick={() => setSelectedRole('user')}
          >
            👨‍🎓 Student
          </button>
          <button
            style={roleButtonStyle(selectedRole === 'admin')}
            onClick={() => setSelectedRole('admin')}
          >
            🛡️ Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              style={inputStyle}
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
            />
          )}

          <input
            style={inputStyle}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            style={inputStyle}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          {!isLogin && selectedRole === 'user' && (
            <>
              <input
                style={inputStyle}
                type="text"
                name="studentId"
                placeholder="Student ID"
                value={formData.studentId || ''}
                onChange={handleInputChange}
                required
              />
              <input
                style={inputStyle}
                type="text"
                name="department"
                placeholder="Department (e.g., Computer Science)"
                value={formData.department || ''}
                onChange={handleInputChange}
                required
              />
              <select
                style={inputStyle}
                name="year"
                value={formData.year || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <input
                style={inputStyle}
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone || ''}
                onChange={handleInputChange}
              />
            </>
          )}

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? '⏳ Processing...' : 
             isLogin ? `🔐 Sign In as ${selectedRole === 'user' ? 'Student' : 'Admin'}` : 
             `📝 Register as ${selectedRole === 'user' ? 'Student' : 'Admin'}`}
          </button>
        </form>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '0.9rem',
            width: '100%',
            padding: '1rem',
            marginTop: '1rem'
          }}
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
            setFormData({ email: '', password: '', role: selectedRole });
          }}
        >
          {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in"}
        </button>

        {message && <div style={messageStyle}>{message}</div>}
      </div>
    </div>
  );
};

export default SimpleLogin;

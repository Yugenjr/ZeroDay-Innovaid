// Mock authentication service that works without backend
export interface AppUser {
  uid: string;
  _id: string; // For backward compatibility
  name: string;
  email: string;
  role: 'user' | 'admin';
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
  createdAt: Date;
}

// Mock user database (in real app, this would be Firebase/backend)
const mockUsers: AppUser[] = [
  {
    uid: 'admin-1',
    _id: 'admin-1',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    createdAt: new Date()
  },
  {
    uid: 'student-1',
    _id: 'student-1',
    name: 'John Doe',
    email: 'john@college.edu',
    role: 'user',
    studentId: 'CS2021001',
    department: 'Computer Science',
    year: 3,
    phone: '+1234567890',
    createdAt: new Date()
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: { [email: string]: string } = {
  'admin@college.edu': 'admin123',
  'john@college.edu': 'student123'
};

export const registerUser = async (
  email: string,
  password: string,
  userData: {
    name: string;
    role: 'user' | 'admin';
    studentId?: string;
    department?: string;
    year?: number;
    phone?: string;
  }
) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if user already exists
  if (mockUsers.find(user => user.email === email)) {
    return {
      success: false,
      message: 'User already exists with this email'
    };
  }

  // Create new user
  const userId = `user-${Date.now()}`;
  const newUser: AppUser = {
    uid: userId,
    _id: userId,
    name: userData.name,
    email: email,
    role: userData.role,
    studentId: userData.studentId,
    department: userData.department,
    year: userData.year,
    phone: userData.phone,
    createdAt: new Date()
  };

  // Add to mock database
  mockUsers.push(newUser);
  mockPasswords[email] = password;

  // Store in localStorage for persistence
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  localStorage.setItem('mockPasswords', JSON.stringify(mockPasswords));

  return {
    success: true,
    user: newUser,
    message: 'Registration successful!'
  };
};

export const loginUser = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Load from localStorage if available
  const storedUsers = localStorage.getItem('mockUsers');
  const storedPasswords = localStorage.getItem('mockPasswords');
  
  if (storedUsers && storedPasswords) {
    const users = JSON.parse(storedUsers);
    const passwords = JSON.parse(storedPasswords);
    mockUsers.push(...users.filter((u: AppUser) => !mockUsers.find(mu => mu.email === u.email)));
    Object.assign(mockPasswords, passwords);
  }

  // Find user
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return {
      success: false,
      message: 'No user found with this email'
    };
  }

  // Check password
  if (mockPasswords[email] !== password) {
    return {
      success: false,
      message: 'Invalid password'
    };
  }

  return {
    success: true,
    user: user,
    message: 'Login successful!'
  };
};

export const logoutUser = async () => {
  // Clear any stored session data
  localStorage.removeItem('user');
  return {
    success: true,
    message: 'Logged out successfully!'
  };
};

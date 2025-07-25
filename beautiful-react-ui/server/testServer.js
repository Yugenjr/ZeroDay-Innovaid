const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5001',
  credentials: true
}));
app.use(express.json());

// In-memory storage for testing (will be replaced with MongoDB)
let users = [];

// JWT Secret
const JWT_SECRET = 'innovaid_super_secret_key_2024';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, year, phone } = req.body;

    console.log('📝 Registration attempt:', { name, email, role, studentId, department, year });

    // Check if user exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if student ID exists (for users only)
    if (role === 'user' && studentId) {
      const studentExists = users.find(user => user.studentId === studentId);
      if (studentExists) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const newUser = {
      _id: Date.now().toString(), // Simple ID for testing
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date()
    };

    // Add role-specific fields
    if (role === 'user') {
      newUser.studentId = studentId;
      newUser.department = department;
      newUser.year = year;
      newUser.phone = phone;
    }

    // Save user to memory
    users.push(newUser);

    console.log('✅ User registered successfully:', { id: newUser._id, name, email, role });
    console.log('👥 Total users in memory:', users.length);

    // Return success response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        ...userWithoutPassword,
        token: generateToken(newUser._id)
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('🔐 Login attempt:', { email, role });

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful:', { id: user._id, name: user.name, role: user.role });

    // Return success response
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...userWithoutPassword,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    success: true,
    data: usersWithoutPasswords,
    count: users.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 InnovAid Test Server is running!',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      users: 'GET /api/users'
    },
    usersInMemory: users.length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    usersRegistered: users.length
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log('🚀 InnovAid Test Server running on port', PORT);
  console.log('🧪 Using in-memory storage for testing');
  console.log('🔗 Frontend should connect to: http://localhost:5000');
  console.log('✅ Ready to test authentication!');
});

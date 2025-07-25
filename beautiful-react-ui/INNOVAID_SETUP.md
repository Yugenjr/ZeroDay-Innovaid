# 🚀 InnovAid - Campus Utilities Platform

## 🎯 Project Overview

InnovAid is an extraordinary campus utilities platform designed for college students and administrators. It features role-based authentication, beautiful UI, and comprehensive campus services management.

## ✨ Features

### 🔐 Authentication System
- **Role-based login** (Student/Admin)
- **JWT token authentication**
- **Secure password hashing**
- **Protected routes**
- **Automatic token refresh**

### 🎨 UI/UX Features
- **Extraordinary login page** with animations
- **Responsive design**
- **Modern glassmorphism effects**
- **Smooth transitions and micro-interactions**
- **Role-specific dashboards**

### 👥 User Roles

#### 📚 Student Features
- Personal dashboard with stats
- Library services access
- Event management
- Campus navigation
- Notifications
- Profile management

#### 🛡️ Admin Features
- System administration panel
- User management
- Analytics and reports
- Facility management
- Notification center
- Service monitoring

## 🛠️ Tech Stack

### Frontend
- **React 17** with TypeScript
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Hook Form** with Yup validation
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Update the `.env` file with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=innovaid_super_secret_key_2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run server  # Backend only
npm start       # Frontend only
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000 (shows available endpoints)

## 🔧 MongoDB Connection Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env` file

### Option 2: Local MongoDB
```bash
# Install MongoDB locally
# Update MONGODB_URI to: mongodb://localhost:27017/innovaid
```

## 📱 Usage Guide

### 🔐 Authentication Flow

#### Student Registration
1. Select "Student" role
2. Fill in required fields:
   - Name, Email, Password
   - Student ID, Department, Year
   - Phone (optional)
3. Click "Register as Student"

#### Admin Registration
1. Select "Admin" role
2. Fill in basic fields:
   - Name, Email, Password
3. Click "Register as Admin"

#### Login
1. Select your role (Student/Admin)
2. Enter email and password
3. Click "Sign In"

### 🎯 Dashboard Features

#### Student Dashboard
- **Welcome section** with personalized greeting
- **Statistics cards** showing activity metrics
- **Service cards** for campus utilities:
  - Library Services
  - Event Management
  - Campus Navigation
  - Notifications
  - Account Settings
  - Feedback

#### Admin Dashboard
- **System overview** with key metrics
- **Management sections**:
  - User Management
  - Library Management
  - Event Management
  - Facility Management
  - Notification Center
  - Analytics & Reports

## 🔒 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT tokens** with expiration
- **Role-based access control**
- **Protected API endpoints**
- **Input validation** with Yup schemas
- **CORS protection**
- **Environment variable protection**

## 🎨 Design System

### Color Palette
- **Primary**: Linear gradient (#667eea → #764ba2)
- **Secondary**: Linear gradient (#f093fb → #f5576c)
- **Success**: Linear gradient (#4facfe → #00f2fe)
- **Warning**: Linear gradient (#43e97b → #38f9d7)
- **Error**: Linear gradient (#fa709a → #fee140)

### Typography
- **Font**: Inter (system fallback)
- **Weights**: 400, 500, 600, 700, 800

### Animations
- **Framer Motion** for page transitions
- **CSS animations** for micro-interactions
- **Glassmorphism effects** with backdrop-filter
- **Floating shapes** background animation

## 📁 Project Structure

```
src/
├── components/
│   ├── Login/
│   │   └── LoginPage.tsx
│   ├── Dashboard/
│   │   ├── UserDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── styles/
│   └── GlobalStyles.ts
└── App.tsx

server/
├── config/
│   └── database.js
├── controllers/
│   └── authController.js
├── middleware/
│   └── auth.js
├── models/
│   └── User.js
├── routes/
│   └── authRoutes.js
├── utils/
│   └── generateToken.js
└── server.js
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure IP is whitelisted in MongoDB Atlas
   - Verify credentials

2. **CORS Errors**
   - Check CLIENT_URL in .env
   - Ensure ports match (3000 for frontend, 5000 for backend)

3. **Authentication Issues**
   - Clear localStorage
   - Check JWT_SECRET in .env
   - Verify token expiration

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **API Testing**: Use the health endpoint `/health` to test backend
3. **Database**: Check MongoDB Compass for data visualization
4. **Debugging**: Check browser console and server logs

## 🎉 Next Steps

1. **Add your MongoDB connection string**
2. **Test the authentication flow**
3. **Customize the UI to match your college branding**
4. **Add more campus-specific services**
5. **Deploy to production**

## 📞 Support

If you need help setting up or customizing InnovAid:
1. Check the troubleshooting section
2. Review the code comments
3. Test with the provided demo data
4. Ensure all dependencies are installed

---

**Built with ❤️ for college campuses everywhere!** 🎓

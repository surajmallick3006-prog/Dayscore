# 🏗️ DayScore - Tech Stack & Architecture Documentation

## 📋 **Project Overview**
DayScore is a comprehensive daily productivity and wellness tracking application that combines task management, time tracking, health monitoring, mood analysis, and AI-powered emotional support into a unified dashboard experience.

---

## 🛠️ **Complete Tech Stack**

### **Frontend (Client)**
```
📱 React 18.2.0
├── 🎨 UI Framework: React + JSX
├── 🎯 State Management: React Context API + useReducer
├── 🛣️ Routing: React Router DOM v6.8.1
├── 💅 Styling: Tailwind CSS v3.3.6
├── 🎭 Animations: Framer Motion v10.16.16
├── 📊 Charts: Recharts v2.8.0
├── 🔔 Notifications: React Hot Toast v2.4.1
├── 🎨 Icons: Lucide React v0.294.0
├── 📅 Date Utils: date-fns v2.30.0
├── 🌐 HTTP Client: Axios v1.6.2
├── 🔥 Database: Firebase v12.8.0
├── 📧 Email Service: EmailJS v4.4.1
└── 🎨 CSS Processing: PostCSS + Autoprefixer
```

### **Backend (Server)**
```
🖥️ Node.js + Express 4.18.2
├── 🗄️ Database: MongoDB + Mongoose v8.0.3
├── 🔐 Authentication: JWT + bcryptjs
├── 🛡️ Security: Helmet v7.1.0 + CORS
├── ⚡ Rate Limiting: Express Rate Limit v7.1.5
├── ✅ Validation: Express Validator v7.0.1
├── 📧 Email: EmailJS Node v5.0.2
├── 🌐 HTTP Client: Axios v1.13.2
├── 🔧 Environment: dotenv v16.3.1
└── 🔄 Development: Nodemon v3.0.2
```

### **AI & External Services**
```
🧠 AI Integration
├── 🤖 OpenAI GPT-4o-mini API
├── 🔥 Firebase Firestore (AI History)
├── 📧 EmailJS (OTP Authentication)
└── 🌐 Custom AI Service Layer
```

### **Development & Build Tools**
```
🔧 Development Environment
├── ⚛️ Create React App (React Scripts 5.0.1)
├── 🔄 Concurrently v8.2.2 (Multi-process)
├── 📦 npm (Package Management)
├── 🎯 ESLint (Code Quality)
├── 🎨 Prettier (Code Formatting)
└── 🔧 VS Code (Recommended IDE)
```

---

## 🏛️ **System Architecture**

### **High-Level Architecture Diagram**
```
┌─────────────────────────────────────────────────────────────────┐
│                        🌐 CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  📱 React Frontend (Port 3000)                                 │
│  ├── 🎨 UI Components (Tailwind CSS)                           │
│  ├── 🛣️ React Router (SPA Navigation)                          │
│  ├── 🎯 Context API (State Management)                         │
│  ├── 🔔 Toast Notifications                                    │
│  └── 📊 Data Visualization (Recharts)                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                            🌐 HTTP/HTTPS
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       🖥️ SERVER LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  🖥️ Node.js + Express API (Port 5000)                          │
│  ├── 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)      │
│  ├── 🔐 Authentication (JWT + bcrypt)                          │
│  ├── ✅ Request Validation                                     │
│  ├── 🛣️ RESTful API Routes                                     │
│  └── 📊 Business Logic Layer                                   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                            📊 Database Queries
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                      🗄️ DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  🍃 MongoDB (Primary Database)                                 │
│  ├── 👤 Users Collection                                       │
│  ├── ✅ Tasks Collection                                       │
│  ├── ⏰ Time Logs Collection                                   │
│  ├── 🏥 Health Data Collection                                 │
│  ├── 😊 Mood Logs Collection                                   │
│  ├── 📱 Screen Time Collection                                 │
│  └── 📊 Day Scores Collection                                  │
│                                                                 │
│  🔥 Firebase Firestore (Secondary)                             │
│  ├── 👤 User Credentials                                       │
│  ├── 🧠 AI Popup History                                       │
│  └── 📧 OTP Verification                                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                            🌐 External APIs
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  🤖 OpenAI API (GPT-4o-mini)                                   │
│  ├── 🧠 AI Analysis & Insights                                 │
│  ├── 💬 Emotional Support Messages                             │
│  └── 🎯 Contextual Recommendations                             │
│                                                                 │
│  📧 EmailJS Service                                             │
│  ├── 🔐 OTP Email Delivery                                     │
│  ├── ✅ Email Verification                                     │
│  └── 📬 Notification System                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Data Flow Architecture**

### **Authentication Flow**
```
1. 👤 User Registration/Login
   ├── 📧 Email + Password Input
   ├── 🔐 OTP Generation (EmailJS)
   ├── ✅ OTP Verification
   ├── 🔥 Firebase Credential Storage
   ├── 🎫 JWT Token Generation
   └── 🏠 Dashboard Redirect

2. 🔐 Session Management
   ├── 🎫 JWT Token Validation
   ├── 🔄 Auto-refresh Mechanism
   ├── 🚪 Logout Functionality
   └── 🛡️ Protected Route Access
```

### **Data Management Flow**
```
1. 📊 Data Collection
   ├── ✅ Task Management (CRUD)
   ├── ⏰ Time Tracking (Start/Stop/Log)
   ├── 🏥 Health Metrics (Sleep, Activity, Water)
   ├── 😊 Mood & Wellness Scoring
   └── 📱 Screen Time Monitoring

2. 💾 Data Storage
   ├── 🍃 MongoDB (Primary Data)
   ├── 🔥 Firebase (Auth + AI History)
   ├── 💾 LocalStorage (Temporary/Cache)
   └── 🎯 Context API (Runtime State)

3. 📈 Data Processing
   ├── 📊 Day Score Calculation
   ├── 📈 Trend Analysis
   ├── 🎯 Goal Tracking
   └── 🧠 AI Context Building
```

### **AI Integration Flow**
```
1. 🧠 AI Analysis Pipeline
   ├── 📊 User Data Collection
   ├── 🎯 Context Building
   ├── 🤖 OpenAI API Call
   ├── 💬 Message Generation
   └── 🎨 Popup Display

2. 🎭 Popup System
   ├── 🌟 Praise/Motivate (Blue-Purple)
   ├── 🫂 Console/Emotional (Soft Pastel)
   ├── ⚠️ Warning/Balance (Orange)
   └── ⚡ Nudge/Action (Clean White)

3. 🌱 Recovery Mode
   ├── 💚 Gentle Messaging
   ├── 🔇 Reduced Notifications
   ├── 🎯 Emotional Support Focus
   └── 💾 Persistent Settings
```

---

## 📁 **Project Structure**

### **Frontend Structure**
```
client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── AIControls.js    # AI System Controls
│   │   ├── AIPopup.js       # AI Message Popups
│   │   ├── Header.js        # Navigation Header
│   │   ├── Sidebar.js       # Navigation Sidebar
│   │   ├── Layout.js        # Page Layout Wrapper
│   │   ├── LoadingSpinner.js # Loading States
│   │   ├── Logo.js          # Brand Logo Component
│   │   └── [Charts/Widgets] # Data Visualization
│   ├── pages/               # Page Components
│   │   ├── Dashboard.js     # Main Dashboard
│   │   ├── TasksPage.js     # Task Management
│   │   ├── TimeTrackerPage.js # Time Tracking
│   │   ├── HealthPage.js    # Health Overview
│   │   ├── MoodPage.js      # Mood & Wellness
│   │   ├── AnalyticsPage.js # Reports & Analytics
│   │   ├── ProfilePage.js   # User Profile
│   │   ├── LoginPage.js     # Authentication
│   │   └── RegisterPage.js  # User Registration
│   ├── context/             # State Management
│   │   ├── AIContext.js     # AI System State
│   │   ├── AuthContext.js   # Authentication State
│   │   ├── DataContext.js   # Application Data
│   │   └── [Specialized Contexts]
│   ├── services/            # API & External Services
│   │   ├── aiService.js     # OpenAI Integration
│   │   ├── authService.js   # Authentication API
│   │   ├── hybridAuthService.js # Hybrid Auth System
│   │   └── [Data Services]
│   ├── config/              # Configuration
│   │   └── firebase.js      # Firebase Setup
│   ├── App.js               # Main App Component
│   ├── index.js             # React Entry Point
│   └── index.css            # Global Styles
├── package.json             # Dependencies & Scripts
├── tailwind.config.js       # Tailwind Configuration
└── postcss.config.js        # PostCSS Configuration
```

### **Backend Structure**
```
server/
├── routes/                  # API Route Handlers
│   ├── auth.js             # Authentication Routes
│   ├── tasks.js            # Task Management API
│   ├── timeTracker.js      # Time Tracking API
│   ├── health.js           # Health Data API
│   ├── mood.js             # Mood Tracking API
│   ├── screenTime.js       # Screen Time API
│   ├── dayScore.js         # Day Score Calculation
│   └── analytics.js        # Analytics & Reports
├── models/                  # Database Models
│   ├── User.js             # User Schema
│   ├── Task.js             # Task Schema
│   ├── TimeLog.js          # Time Log Schema
│   ├── HealthData.js       # Health Data Schema
│   ├── MoodLog.js          # Mood Log Schema
│   ├── ScreenTime.js       # Screen Time Schema
│   └── DayScore.js         # Day Score Schema
├── middleware/              # Express Middleware
│   ├── auth.js             # JWT Authentication
│   └── validation.js       # Request Validation
├── utils/                   # Utility Functions
│   ├── dayScoreAI.js       # AI Score Calculation
│   └── emailService.js     # Email Utilities
├── index.js                # Server Entry Point
└── package.json            # Dependencies & Scripts
```

---

## 🔐 **Security Architecture**

### **Authentication & Authorization**
```
🔐 Multi-Layer Security
├── 📧 Email-based Registration
├── 🔐 OTP Verification (EmailJS)
├── 🎫 JWT Token Authentication
├── 🔥 Firebase Credential Storage
├── 🛡️ Protected Route Guards
├── ⏰ Token Expiration & Refresh
└── 🚪 Secure Logout Process
```

### **Data Protection**
```
🛡️ Security Measures
├── 🔒 HTTPS Encryption (Production)
├── 🛡️ Helmet.js Security Headers
├── 🌐 CORS Configuration
├── ⚡ Rate Limiting (Express)
├── ✅ Input Validation & Sanitization
├── 🔐 Password Hashing (bcrypt)
├── 🎫 JWT Secret Management
└── 🔥 Firebase Security Rules
```

### **Privacy & Compliance**
```
🔒 Privacy Protection
├── 📊 Minimal Data Collection
├── 🏠 Local Data Processing
├── 🔐 Encrypted Data Storage
├── 👤 User Data Control
├── 🗑️ Data Deletion Rights
└── 📋 Transparent Data Usage
```

---

## 📊 **Database Schema**

### **MongoDB Collections**
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  name: String,
  createdAt: Date,
  lastLogin: Date,
  preferences: {
    theme: String,
    notifications: Boolean,
    aiEnabled: Boolean
  }
}

// Tasks Collection
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  category: String, // 'academic' | 'personal'
  status: String,   // 'todo' | 'in-progress' | 'done'
  priority: String, // 'low' | 'medium' | 'high'
  dueDate: Date,
  createdAt: Date,
  completedAt: Date
}

// Time Logs Collection
{
  _id: ObjectId,
  userId: ObjectId,
  category: String, // 'study' | 'work' | 'entertainment'
  duration: Number, // minutes
  date: Date,
  createdAt: Date
}

// Health Data Collection
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  sleep: {
    duration: Number, // hours
    quality: Number   // 1-10 scale
  },
  activity: {
    steps: Number,
    activeMinutes: Number
  },
  water: {
    intake: Number,   // liters
    goal: Number
  }
}

// Mood Logs Collection
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  mood: Number,        // 1-5 scale
  energy: Number,      // 1-10 scale
  stress: Number,      // 1-10 scale
  notes: String,
  moodScore: Number,   // calculated score
  wellnessScore: Number,
  createdAt: Date
}

// Day Scores Collection
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  overallScore: Number,
  breakdown: {
    productivity: Number,
    health: Number,
    focus: Number,
    wellness: Number
  },
  createdAt: Date
}
```

### **Firebase Collections**
```javascript
// User Credentials (Firestore)
{
  uid: String,
  email: String,
  emailVerified: Boolean,
  createdAt: Timestamp,
  lastLogin: Timestamp
}

// AI Popup History (Firestore)
{
  userId: String,
  date: String,
  timestamp: Timestamp,
  intent: String, // 'motivate' | 'console' | 'praise' | 'warn' | 'nudge'
  tone: String,   // 'calm' | 'friendly' | 'energetic' | 'serious'
  message: String,
  cta: String,
  shownAt: Timestamp
}
```

---

## 🚀 **Deployment Architecture**

### **Development Environment**
```
🔧 Local Development
├── 📱 React Dev Server (localhost:3000)
├── 🖥️ Express API Server (localhost:5000)
├── 🍃 MongoDB Local Instance
├── 🔥 Firebase Emulators (Optional)
├── 🤖 OpenAI API (Development Key)
└── 📧 EmailJS (Development Config)
```

### **Production Deployment**
```
🌐 Production Stack
├── 📱 Frontend: Vercel/Netlify (Static Hosting)
├── 🖥️ Backend: Railway/Heroku (Node.js Hosting)
├── 🍃 Database: MongoDB Atlas (Cloud)
├── 🔥 Firebase: Production Project
├── 🤖 OpenAI: Production API Key
├── 📧 EmailJS: Production Service
├── 🔒 SSL: Automatic HTTPS
└── 🌐 CDN: Global Content Delivery
```

### **CI/CD Pipeline**
```
🔄 Automated Deployment
├── 📝 Git Push to Main Branch
├── 🧪 Automated Testing
├── 🏗️ Build Process
├── 🚀 Deployment to Production
├── 🔍 Health Checks
└── 📊 Performance Monitoring
```

---

## 📈 **Performance & Scalability**

### **Frontend Optimization**
```
⚡ Performance Features
├── 🎯 Code Splitting (React.lazy)
├── 📦 Bundle Optimization
├── 🖼️ Image Optimization
├── 💾 Intelligent Caching
├── 🔄 Service Workers (PWA)
├── 📊 Lazy Loading Components
└── 🎨 CSS Optimization (Tailwind)
```

### **Backend Optimization**
```
🚀 Server Performance
├── 📊 Database Indexing
├── 💾 Redis Caching (Future)
├── ⚡ Connection Pooling
├── 🔄 Request Compression
├── 📈 Load Balancing (Future)
├── 📊 Query Optimization
└── 🔍 Performance Monitoring
```

### **Scalability Considerations**
```
📈 Growth Planning
├── 🏗️ Microservices Architecture (Future)
├── 📊 Database Sharding
├── 🌐 CDN Implementation
├── 🔄 Horizontal Scaling
├── 📈 Auto-scaling Groups
├── 🔍 Performance Metrics
└── 📊 Usage Analytics
```

---

## 🧪 **Testing Strategy**

### **Frontend Testing**
```
🧪 React Testing
├── ⚛️ React Testing Library
├── 🃏 Jest Unit Tests
├── 🎭 Component Testing
├── 🔄 Integration Tests
├── 🌐 E2E Testing (Cypress)
└── 📊 Coverage Reports
```

### **Backend Testing**
```
🧪 API Testing
├── 🃏 Jest Unit Tests
├── 🌐 Supertest Integration
├── 📊 Database Testing
├── 🔐 Authentication Testing
├── 🛡️ Security Testing
└── 📈 Load Testing
```

### **AI System Testing**
```
🧪 AI Testing
├── 🤖 Mock OpenAI Responses
├── 🎯 Trigger Logic Testing
├── 💬 Message Quality Testing
├── 🔄 Fallback System Testing
└── 👤 User Experience Testing
```

---

## 🔮 **Future Enhancements**

### **Technical Roadmap**
```
🚀 Planned Improvements
├── 📱 Mobile App (React Native)
├── 🔄 Real-time Updates (WebSockets)
├── 📊 Advanced Analytics (ML)
├── 🌐 Multi-language Support (i18n)
├── 🎨 Theme Customization
├── 🔌 Third-party Integrations
├── 📈 Advanced AI Features
└── 🏗️ Microservices Migration
```

### **AI Evolution**
```
🧠 AI Enhancements
├── 🎯 Personalized Learning
├── 🔮 Predictive Analytics
├── 🗣️ Voice Interactions
├── 👁️ Computer Vision
├── 🤝 Team Collaboration AI
├── 📊 Advanced Sentiment Analysis
└── 🌐 Multi-modal AI
```

---

## 📞 **Support & Maintenance**

### **Monitoring & Logging**
```
📊 System Monitoring
├── 🔍 Application Performance Monitoring
├── 📊 Database Performance Metrics
├── 🚨 Error Tracking & Alerting
├── 👤 User Analytics
├── 🤖 AI Usage Metrics
├── 🔐 Security Monitoring
└── 📈 Business Metrics
```

### **Maintenance Schedule**
```
🔧 Regular Maintenance
├── 📦 Weekly Dependency Updates
├── 🔐 Monthly Security Patches
├── 📊 Quarterly Performance Reviews
├── 🧪 Continuous Testing
├── 📈 Feature Usage Analysis
└── 👤 User Feedback Integration
```

---

## 🎯 **Conclusion**

DayScore represents a modern, full-stack web application that combines productivity tracking with emotional intelligence. The architecture is designed for:

- **🔒 Security**: Multi-layer authentication and data protection
- **⚡ Performance**: Optimized for speed and responsiveness  
- **📈 Scalability**: Ready for growth and feature expansion
- **🧠 Intelligence**: AI-powered insights and emotional support
- **👤 User-Centric**: Focused on user experience and well-being
- **🔧 Maintainable**: Clean code structure and comprehensive testing

The tech stack leverages modern, battle-tested technologies while maintaining flexibility for future enhancements and integrations.

---

*Last Updated: January 2026*
*Version: 1.0.0*
*Architecture Review: Complete* ✅
# DayScore - Daily Productivity & Wellness Tracker

A modern web application that calculates your daily productivity score (0-100) based on tasks, study time, health metrics, mood, and focus levels.

## 🚀 Features

- **Day Score Calculation**: Real-time scoring based on multiple factors
- **Task Management**: To-do, in-progress, and completed task tracking
- **Time Tracking**: Study and work hour monitoring
- **Health & Activity**: Sleep, steps, and wellness metrics
- **Mood Tracking**: Daily mood and energy level logging
- **Analytics**: Comprehensive reports and trend analysis
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Recharts for data visualization
- Lucide React for icons
- React Router for navigation
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation

1. Clone the repository
2. Install dependencies for all packages:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Add your MongoDB connection string and JWT secret

4. Start the development servers:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
dayscore-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based pages
│   │   ├── context/       # Global state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # CSS and styling
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth and validation
│   ├── controllers/      # Business logic
│   └── utils/           # Server utilities
└── docs/                # Documentation
```

## 🎯 Day Score Calculation

The Day Score is calculated using weighted factors:
- **Productivity Score** (30%): Task completion, work hours
- **Health Score** (25%): Sleep, activity, steps
- **Focus Score** (25%): Screen time, distractions
- **Mood Score** (20%): Energy level, wellness metrics

## 🔧 API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /tasks` - Get user tasks
- `POST /tasks` - Create new task
- `GET /dayscore` - Get current day score
- `POST /timetracker` - Log time entries
- `GET /analytics` - Get user analytics

## 📱 Pages

1. **Landing Page** - Product introduction and auth
2. **Dashboard** - Main day score overview
3. **Tasks & Productivity** - Task management
4. **Time Tracker** - Study/work time logging
5. **Health & Activity** - Wellness metrics
6. **Mood & Mental Wellness** - Mood tracking
7. **Reports & Analytics** - Data insights
8. **Profile & Settings** - User preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
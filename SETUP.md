# DayScore Setup Guide

## Prerequisites

Before setting up DayScore, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup

1. **Clone or extract the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd dayscore-app
   
   # Or extract the zip file and navigate to the folder
   ```

2. **Install all dependencies and seed data**
   ```bash
   npm run setup
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Getting Started

After running the setup, you can create your own account through the registration process.

## Manual Setup (Alternative)

If the quick setup doesn't work, follow these steps:

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Setup Environment Variables

Copy the environment file:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayscore
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows (if installed as service)
net start MongoDB

# On Linux
sudo systemctl start mongod
```

### 4. Seed the Database

```bash
cd server
npm run seed
cd ..
```

### 5. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

## Project Structure

```
dayscore-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based pages
│   │   ├── context/       # Global state management
│   │   └── ...
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth and validation
│   ├── utils/           # Utilities and seed data
│   └── ...
├── package.json          # Root package file
└── README.md            # Project documentation
```

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Install dependencies
- `npm run install-all` - Install all dependencies

### Server (cd server)
- `npm run dev` - Start backend in development mode
- `npm start` - Start backend in production mode

### Client (cd client)
- `npm start` - Start frontend development server
- `npm run build` - Build frontend for production

## Features

### ✅ Implemented Features

**Authentication & User Management**
- User registration and login
- JWT-based authentication
- Protected routes
- User profile management

**Dashboard & Day Score**
- Real-time day score calculation (0-100)
- Component scores (Productivity, Health, Focus, Mood)
- Score breakdown and insights
- Customizable score weights

**Task Management**
- Create, edit, delete tasks
- Task status tracking (To Do, In Progress, Done)
- Priority levels and categories
- Due dates and completion tracking

**Time Tracking**
- Study and work time logging
- Session tracking with quality ratings
- Daily and weekly time analytics

**Health & Activity**
- Sleep duration and quality tracking
- Activity metrics (steps, exercise)
- Health score calculation

**Mood & Wellness**
- Daily mood logging with emojis
- Energy and stress level tracking
- Wellness score calculation

**Screen Time & Focus**
- Screen time category tracking
- Distraction monitoring
- Focus score calculation

**Analytics & Reports**
- Comprehensive dashboard
- Trend analysis
- Best/worst day insights
- Personalized recommendations

### 🚧 Areas for Enhancement

- Real-time notifications
- Data export functionality
- Mobile app integration
- Advanced analytics
- Social features
- Goal setting and challenges

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Day Score
- `GET /api/dayscore/today` - Get today's score
- `POST /api/dayscore/calculate` - Recalculate score

### Data Tracking
- `GET/POST /api/timetracker` - Time logs
- `GET/POST /api/health` - Health data
- `GET/POST /api/mood` - Mood logs
- `GET/POST /api/screentime` - Screen time data

### Analytics
- `GET /api/analytics/overview` - Analytics overview

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB is accessible on the specified port

**Port Already in Use**
- Change the PORT in `server/.env`
- Kill processes using the ports: `lsof -ti:3000,5000 | xargs kill`

**Dependencies Issues**
- Delete `node_modules` folders and `package-lock.json`
- Run `npm run install-all` again

**Seed Data Issues**
- Ensure MongoDB is running
- Check database permissions
- Run `npm run seed` manually

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check the `.env` file configuration
5. Try the manual setup steps

## Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/`, models in `server/models/`
2. **Frontend**: Add pages in `client/src/pages/`, components in `client/src/components/`
3. **State Management**: Update context providers in `client/src/context/`

### Database Schema

The app uses MongoDB with Mongoose ODM. Key collections:
- `users` - User accounts and preferences
- `tasks` - Task management
- `timelogs` - Time tracking data
- `healthdata` - Health and activity metrics
- `moodlogs` - Mood and wellness data
- `screentimes` - Screen time and focus data
- `dayscores` - Calculated daily scores

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Happy tracking! 📊✨**
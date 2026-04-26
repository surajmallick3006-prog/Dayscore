# DayScore - AI Copilot Instructions

## Project Overview

**DayScore** is a comprehensive daily productivity & wellness tracking application that combines task management, time tracking, health monitoring, mood analysis, and AI-powered insights into a unified dashboard.

**Key Goal**: Calculate real-time Day Score (0-100) based on weighted factors (Productivity 30%, Health 25%, Focus 25%, Mood 20%).

---

## System Architecture

### Three-Tier Architecture

```
Frontend (React 3000)
    ↓ (HTTP/Axios)
Backend API (Node.js/Express 5000)
    ↓ (Mongoose)
Database (MongoDB + Firebase Firestore)
    
AI Service (Python FastAPI) ← Separate process for analytics
```

### Core Data Models

- **User**: Authentication, preferences, daily goals, score weights
- **Task**: Title, category, status (to-do/in-progress/completed), priority
- **TimeLog**: Type (study/work/entertainment), duration, timestamp
- **HealthData**: Sleep hours/quality, steps, water intake, exercise
- **MoodData**: Mood (1-5), energy (1-10), stress, motivation, anxiety
- **DayScore**: Real-time calculation, historical tracking, components (productivity/health/focus/mood)

---

## Frontend Architecture (React 18)

### State Management Pattern: Context API + useReducer

**Three Main Contexts** (always import from `context/` folder):

1. **ServerAuthContext** - User auth state, token management, login/logout
   - Hook: `useServerAuth()` - Returns `{ user, login, logout, isAuthenticated }`
   - Token stored in localStorage, auto-included in requests via interceptor

2. **DataContext** - All user data (tasks, time logs, health, mood, day score)
   - Hook: `useData()` - Returns state + fetch/create/update/delete functions
   - Uses reducer with actions: `SET_TASKS`, `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`, etc.
   - Auto-includes auth token via axios interceptor

3. **AIContext** - AI analysis state, popup management, user context building
   - Hook: `useAI()` - Returns `{ currentPopup, isAnalyzing, triggerAnalysis }`
   - Manages popup rate limiting (check `lastPopupTime` in localStorage)
   - Recovery mode fallback when AI service unavailable

### Component Organization

- **Pages** (route-based): Dashboard, TasksPage, AnalyticsPage, etc.
- **Components** (reusable): ActivityRings, DayScoreRing, TaskSummary, etc.
- **Services** (API layer): `hybridAuthService`, `dayScoreService`, `aiService`

### Key Service Files

| Service | Purpose | Key Methods |
|---------|---------|------------|
| `hybridAuthService.js` | Dual auth (Server + Firebase/EmailJS OTP) | `login()`, `register()`, `sendOTPEmail()` |
| `dayScoreService.js` | Fetch day score, historical data | `getDayScore()`, `getTrends()` |
| `aiService.js` | AI popup triggers, analysis requests | `requestAnalysis()`, `setRecoveryMode()` |
| `firestoreService.js` | Firebase Firestore queries | `getUserData()`, `saveAnalysis()` |

### Styling Convention

- **Tailwind CSS** exclusively - no custom CSS files
- Color palette: Indigo (primary), Amber (accent), Red (alerts)
- Responsive: `sm:`, `md:`, `lg:` breakpoints for mobile-first design
- Toast notifications: Use `react-hot-toast` for feedback

---

## Backend Architecture (Node.js/Express)

### Server Structure (Port 5000)

```
routes/           → API endpoints (auth, tasks, dayScore, etc.)
models/           → Mongoose schemas (User, Task, TimeLog, etc.)
middleware/       → auth.js (JWT verification), validation.js
utils/            → dayScoreAI.js (score calculation logic)
services/         → Business logic layer
```

### API Endpoint Convention

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth` | POST /register, /login, /logout | User authentication |
| `/api/tasks` | GET/POST/PUT/DELETE | Task CRUD operations |
| `/api/dayscore` | GET /{date} | Fetch day score for specific date |
| `/api/timetracker` | POST, GET | Log study/work time |
| `/api/mood` | POST, GET | Mood/wellness data |
| `/api/health` | POST, GET | Sleep, steps, activity data |
| `/api/analytics` | GET /{period} | Trends and insights |
| `/api/ai` | POST /analyze | Trigger AI analysis (calls Python service) |

### Critical Middleware

- **JWT Auth** (`middleware/auth.js`): Validates Bearer token, extracts `userId`
- **Rate Limiting**: 100 requests per 15 minutes per IP (prevents abuse)
- **CORS**: Hardcoded to `localhost:3000` in dev, domain whitelist in prod
- **Helmet**: Security headers

### Day Score Calculation (server/utils/dayScoreAI.js)

```javascript
const dayScore = Math.round(
  (productivityScore * 0.30) +
  (healthScore * 0.25) +
  (focusScore * 0.25) +
  (moodScore * 0.20)
);
```

**Component Scores:**
- **Productivity**: Task completion % × study hours vs. daily goal
- **Health**: Sleep quality score + steps + water intake + exercise
- **Focus**: Screen time categories (productivity/social/entertainment ratio)
- **Mood**: Mood rating (1-5) + energy + stress levels

### Database Connection

- **MongoDB Atlas** (primary): User data, tasks, time logs, analytics
- **Firebase Firestore**: AI analysis history, user preferences (secondary)
- Graceful fallback: Server runs with limited functionality if MongoDB unavailable

---

## Python AI Service (Port 8000)

### Location: `ai-service/`

**FastAPI service** for advanced analytics and emotional AI support.

### Key Endpoints

- `POST /api/analyze` - Receives user data, returns insights
- `POST /api/emotional-support` - Generates personalized emotional support messages
- `GET /api/trends` - Long-term trend analysis

### Integration with Node.js Backend

Frontend → Express server (`/api/ai` route) → Python AI service via `axios` HTTP call

Python service fetches additional data from Node.js via `NODE_SERVER_URL = "http://localhost:5000"`

### Common Issues & Recovery Mode

- If Python service unavailable: `aiService.setRecoveryMode(true)` disables AI features gracefully
- Client should check `isRecoveryMode` in AIContext before showing AI features

---

## Critical Developer Workflows

### Starting Development

```bash
npm run dev                    # Runs both client (3000) + server (5000) via concurrently
# OR separately:
npm run client                 # Just React frontend
npm run server                 # Just Express backend
```

### Adding a New Feature (Example: New Health Metric)

1. **Backend**: Add MongoDB schema in `server/models/HealthData.js`
2. **API Route**: Add endpoint in `server/routes/health.js`
3. **Context**: Add state + action to `DataContext.js` (e.g., `SET_WATER_INTAKE`)
4. **Service**: Create fetch function in `client/src/services/dayScoreService.js`
5. **Component**: Create UI in `client/src/pages/HealthPage.js` or new component
6. **Score Calculation**: Update `dayScoreAI.js` to include metric in health score
7. **Testing**: Verify data flow: UI → API → DB → AI → Dashboard

### Debugging Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Session expired" toast | JWT token expired | Login again; check `hybridAuthService.getToken()` |
| Tasks not loading | Auth header missing | Verify axios interceptor in `DataContext.js` adding token |
| Day score stuck at 0 | MongoDB unavailable | Check server console for connection error; use fallback data |
| AI popups not showing | Recovery mode enabled | Check Firebase availability; test `aiService.getRecoveryMode()` |
| CORS errors | Frontend URL not whitelisted | Update CORS origin in `server/index.js` line 27 |

---

## Project-Specific Conventions

### Naming & Patterns

- **Context hooks**: PascalCase `useServerAuth()`, `useData()`, `useAI()`
- **Services**: camelCase filename ending with `Service.js`
- **React components**: PascalCase (e.g., `TaskSummary.js`)
- **Database fields**: camelCase (`sleepDuration`, `completedTasks`)
- **Error handling**: Always use `toast.error()` for user feedback, `console.error()` for debugging

### Authentication Flow

Two-system hybrid auth to support both server & Firebase:
1. **HybridAuthService**: Tries Server JWT first, falls back to Firebase
2. **Token refresh**: Auto-refresh via axios interceptor on 401
3. **OTP verification**: EmailJS sends 6-digit code (10-min expiry)

### Rate Limiting & Recovery Patterns

- **AI Popup rate limit**: Min 5-minute gap between popups (check `AIContext.lastPopupTime`)
- **API rate limit**: 100 requests/15 min (built into Express middleware)
- **Recovery mode**: When external service fails, disable gracefully rather than crashing
  - Example: If Python AI service down, AIProvider sets `isRecoveryMode = true`
  - UI checks flag before rendering AI-dependent features

### Firebase Configuration

- Located: `client/src/config/firebase.js`
- Used for: Auth (emailjs OTP), Firestore (AI history backup), offline fallback
- Never hardcode credentials; use `.env` variables

### Environment Variables (.env in server/)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_EMAILJS_SERVICE_ID=service_...
REACT_APP_EMAILJS_TEMPLATE_ID=template_...
```

---

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|------------|
| `server/utils/dayScoreAI.js` | Score calculation logic | Modify weighting, add components |
| `client/src/context/DataContext.js` | Main data state mgmt | Add new data types, API calls |
| `server/models/User.js` | User schema + daily goals | Add user preferences |
| `client/src/pages/Dashboard.js` | Main dashboard view | UI/UX changes |
| `server/routes/dayScore.js` | Day score API endpoints | Modify calculation endpoints |
| `ai-service/main.py` | AI service API | Advanced analytics features |
| `firestore-security-rules.txt` | Firebase access control | Security changes |

---

## Common Gotchas & Tips

1. **Token expiry**: Check `ServerAuthContext` for token refresh logic; don't assume token persists
2. **MongoDB vs Firebase**: Server writes to MongoDB; Firestore is secondary backup
3. **Real-time updates**: Day score NOT real-time; manually refresh via `fetchDayScore()` in DataContext
4. **Async data**: Always check `loading` state in DataContext before rendering (avoid race conditions)
5. **Component re-renders**: Hooks return new objects each render; memoize with `useCallback` if passing to children
6. **CORS origins**: Must include both `localhost:3000` (dev) and production domain in `server/index.js`
7. **AI service crashes**: Python service is optional; always check recovery mode before calling AI endpoints
8. **Task categories**: `Academic` and `Personal` are the two categories (hard-coded in UI)

---

## Architecture Decision Rationale

| Decision | Reason |
|----------|--------|
| React Context over Redux | Smaller bundle, simpler state for this app's complexity |
| MongoDB + Firebase hybrid | Firestore as offline-capable backup, MongoDB for primary analytics |
| Separate Python AI service | Heavy ML computations isolated, scalable independently |
| Two-auth system | Server auth for primary APIs, Firebase for OTP/offline fallback |
| Express rate limiting | Prevent abuse of free tier APIs (OpenAI, EmailJS) |
| Tailwind CSS only | Single source of truth for styling, consistent mobile design |

---

## Testing & Validation

- **Manual testing**: Create test account, navigate full flow (register → create task → log time → track mood → view day score)
- **Day score accuracy**: Verify calculation against formula in `dayScoreAI.js`
- **API validation**: Check `server/middleware/validation.js` for request schema validation
- **Error handling**: Test with MongoDB offline, AI service down, network failures

---

## Resources & Documentation

- [Tech Stack & Architecture](./TECH_STACK_ARCHITECTURE.md) - Detailed tech choices
- [Day Score System](./REAL_TIME_DAY_SCORE_SYSTEM.md) - Calculation details
- [AI Setup](./AI_SETUP.md) - Python service configuration
- [Setup Guide](./SETUP.md) - Installation instructions
- [API Authentication](./AUTHENTICATION_ROUTING_FIXES.md) - Auth edge cases


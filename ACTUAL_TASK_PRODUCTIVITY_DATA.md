# Actual Task & Productivity Data Structure

## 📋 Task Data Structure (MongoDB)

### Task Schema (`server/models/Task.js`)
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: ObjectId("507f1f77bcf86cd799439012"),
  title: "Design New Landing Page",
  description: "Create a modern, responsive landing page for the product",
  status: "in-progress",           // "todo" | "in-progress" | "done"
  priority: "high",                // "low" | "medium" | "high" | "urgent"
  category: "work",                // "work" | "study" | "personal" | "health" | "other"
  panel: "personal",               // "academic" | "personal"
  dueDate: "2024-01-26T00:00:00.000Z",
  completedAt: null,               // Date when completed
  estimatedTime: 120,              // Minutes estimated
  actualTime: 0,                   // Minutes actually spent
  tags: ["design", "frontend"],
  scoreImpact: 8,                  // 1-10 productivity score contribution
  createdAt: "2024-01-25T10:30:00.000Z",
  updatedAt: "2024-01-25T14:20:00.000Z"
}
```

### Task API Response (`GET /api/tasks`)
```javascript
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Design New Landing Page",
      "description": "Create a modern, responsive landing page",
      "status": "in-progress",
      "priority": "high",
      "category": "work",
      "panel": "personal",
      "dueDate": "2024-01-26T00:00:00.000Z",
      "completedAt": null,
      "estimatedTime": 120,
      "actualTime": 0,
      "tags": ["design", "frontend"],
      "scoreImpact": 8,
      "createdAt": "2024-01-25T10:30:00.000Z",
      "updatedAt": "2024-01-25T14:20:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Study JavaScript",
      "status": "todo",
      "priority": "medium",
      "category": "study",
      "panel": "academic",
      "dueDate": "2024-01-25T00:00:00.000Z",
      "scoreImpact": 6
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 2
  }
}
```

### Task Statistics (`GET /api/tasks/stats`)
```javascript
{
  "period": "today",
  "stats": {
    "total": 6,
    "completed": 1,
    "inProgress": 3,
    "todo": 2,
    "completionRate": 16.67,
    "totalScoreImpact": 42,
    "completedScoreImpact": 8
  },
  "dateRange": {
    "startDate": "2024-01-25T00:00:00.000Z",
    "endDate": "2024-01-26T00:00:00.000Z"
  }
}
```

## ⏱️ Time Tracking Data Structure

### TimeLog Schema (`server/models/TimeLog.js`)
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  userId: ObjectId("507f1f77bcf86cd799439012"),
  type: "study",                   // "study" | "work" | "break" | "meeting"
  startTime: "2024-01-25T09:00:00.000Z",
  endTime: "2024-01-25T10:30:00.000Z",
  duration: 90,                    // Minutes
  description: "JavaScript fundamentals review",
  taskId: ObjectId("507f1f77bcf86cd799439013"),  // Optional linked task
  focusQuality: 8,                 // 1-10 rating
  productivityRating: 7,           // 1-10 rating
  breakType: null,                 // For break sessions
  tags: ["javascript", "review"],
  createdAt: "2024-01-25T10:30:00.000Z",
  updatedAt: "2024-01-25T10:30:00.000Z"
}
```

### TimeLog API Response (`GET /api/timetracker`)
```javascript
{
  "timeLogs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "type": "study",
      "startTime": "2024-01-25T09:00:00.000Z",
      "endTime": "2024-01-25T10:30:00.000Z",
      "duration": 90,
      "description": "JavaScript fundamentals review",
      "taskId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Study JavaScript"
      },
      "focusQuality": 8,
      "productivityRating": 7,
      "tags": ["javascript", "review"],
      "createdAt": "2024-01-25T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "type": "work",
      "startTime": "2024-01-25T14:00:00.000Z",
      "duration": 120,
      "description": "Landing page wireframes",
      "focusQuality": 9,
      "productivityRating": 8
    }
  ]
}
```

### Daily Time Statistics (`GET /api/timetracker/stats`)
```javascript
{
  "stats": {
    "study": {
      "duration": 180,      // 3 hours in minutes
      "focus": 7.5,         // Average focus quality
      "productivity": 8.0,   // Average productivity rating
      "sessions": 3         // Number of sessions
    },
    "work": {
      "duration": 240,      // 4 hours in minutes
      "focus": 6.8,
      "productivity": 7.2,
      "sessions": 2
    },
    "break": {
      "duration": 30,
      "focus": 0,
      "productivity": 0,
      "sessions": 2
    },
    "meeting": {
      "duration": 60,
      "focus": 6.0,
      "productivity": 6.5,
      "sessions": 1
    },
    "totalDuration": 510,    // 8.5 hours total
    "overallFocus": 7.2,
    "overallProductivity": 7.6
  },
  "date": "2024-01-25T00:00:00.000Z"
}
```

## 🎯 Client-Side Data Context

### DataContext State (`client/src/context/DataContext.js`)
```javascript
{
  // Task data
  tasks: [
    {
      _id: "507f1f77bcf86cd799439011",
      title: "Design New Landing Page",
      status: "in-progress",
      priority: "high",
      category: "work",
      panel: "personal",
      dueDate: "2024-01-26T00:00:00.000Z",
      scoreImpact: 8
    }
  ],
  
  // Time tracking data
  timeLogs: [
    {
      _id: "507f1f77bcf86cd799439014",
      type: "study",
      startTime: "2024-01-25T09:00:00.000Z",
      duration: 90,
      description: "JavaScript fundamentals review",
      focusQuality: 8,
      productivityRating: 7
    }
  ],
  
  // Loading states
  loading: {
    tasks: false,
    timeLogs: false,
    dayScore: false,
    health: false,
    mood: false,
    screenTime: false,
    analytics: false
  },
  
  // Other data
  dayScore: {
    overall: 76,
    components: {
      productivity: 78,
      health: 82,
      focus: 68,
      wellness: 79
    }
  },
  healthData: null,
  moodData: null,
  screenTime: null,
  analytics: null,
  error: null
}
```

## 📊 Dashboard Data Processing

### Task Counts Calculation
```javascript
// From Dashboard.js
const todoCount = tasks?.filter(t => t.status === 'todo').length || 0;
const inProgressCount = tasks?.filter(t => t.status === 'in-progress').length || 0;
const doneCount = tasks?.filter(t => t.status === 'done').length || 0;
const totalTasks = tasks?.length || 0;
const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
```

### Time Tracking Summary
```javascript
// Filter today's logs
const today = new Date().toDateString();
const todayLogs = timeLogs?.filter(log => {
  const logDate = new Date(log.startTime || log.createdAt);
  return logDate.toDateString() === today;
}) || [];

// Calculate time by type
const studyTime = todayLogs
  .filter(log => log.type === 'study')
  .reduce((total, log) => total + (log.duration || 0), 0);

const workTime = todayLogs
  .filter(log => log.type === 'work')
  .reduce((total, log) => total + (log.duration || 0), 0);
```

### Productivity Score Calculation
```javascript
const calculateProductivityScore = () => {
  if (!tasks || tasks.length === 0) return 50;

  const completionRate = (doneCount / totalTasks) * 100;
  const inProgressBonus = inProgressCount * 5;
  const timeBonus = Math.min(totalTimeToday / 10, 20);
  
  return Math.min(Math.round(completionRate + inProgressBonus + timeBonus), 100);
};
```

## 🔄 Data Flow

### Task Creation Flow
1. **User Input** → Task form data
2. **API Call** → `POST /api/tasks` with task data
3. **Database** → MongoDB saves new task document
4. **Response** → Returns created task with `_id`
5. **State Update** → DataContext adds task to `tasks` array
6. **UI Update** → Dashboard shows updated task counts

### Time Logging Flow
1. **Timer Stop** → User stops time tracking session
2. **API Call** → `POST /api/timetracker` with session data
3. **Database** → MongoDB saves TimeLog document
4. **Response** → Returns created time log
5. **State Update** → DataContext adds to `timeLogs` array
6. **Score Recalc** → Triggers day score recalculation
7. **UI Update** → Dashboard shows updated time totals

### Status Change Flow
1. **Task Update** → User changes task status (todo → in-progress → done)
2. **API Call** → `PUT /api/tasks/:id` with status update
3. **Database** → MongoDB updates task document
4. **Response** → Returns updated task
5. **State Update** → DataContext updates task in array
6. **UI Update** → Dashboard counts update immediately

## 📱 Real-Time Updates

### Dashboard Refresh Cycle
```javascript
// Auto-refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchTasks({ limit: 10 });
    fetchTimeLogs();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Data Synchronization
- **Cross-tab sync**: Changes in Tasks page reflect in Dashboard
- **Real-time counts**: Task status changes update counts immediately  
- **Time tracking**: New sessions appear in dashboard summary
- **Score updates**: Productivity score recalculates with new data

This is the actual data structure and flow used in your DayScore application for task and productivity tracking.
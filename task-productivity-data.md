# Task & Productivity Data Structure

Based on your DayScore application, here's the comprehensive data structure for tasks and productivity tracking:

## 📋 Task Data Structure

### Task Model (`server/models/Task.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,                    // "Design New Landing Page"
  description: String,              // Optional detailed description
  status: String,                   // "todo" | "in-progress" | "done"
  priority: String,                 // "low" | "medium" | "high" | "urgent"
  category: String,                 // "work" | "study" | "personal" | "health" | "other"
  panel: String,                    // "academic" | "personal"
  dueDate: Date,                    // "Jan 26", "Jan 29", etc.
  completedAt: Date,                // When task was completed
  estimatedTime: Number,            // Minutes estimated
  actualTime: Number,               // Minutes actually spent
  tags: [String],                   // Custom tags
  scoreImpact: Number,              // 1-10, contribution to productivity score
  createdAt: Date,
  updatedAt: Date
}
```

### Task Statistics (from your UI)
```javascript
// Task Assignments Summary
{
  todo: 2,           // "To Do" tasks
  inProgress: 3,     // "In Progress" tasks  
  done: 1,           // "Done" tasks
  completionRate: 16.67  // Percentage completed
}

// Panel-based breakdown
{
  academic: {
    todo: 1,
    inProgress: 2, 
    done: 0,
    total: 3
  },
  personal: {
    todo: 1,
    inProgress: 1,
    done: 1, 
    total: 3
  }
}
```

## ⏱️ Time Tracking Data Structure

### TimeLog Model (`server/models/TimeLog.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,                     // "study" | "work" | "break" | "meeting"
  startTime: Date,                  // Session start time
  endTime: Date,                    // Session end time
  duration: Number,                 // Minutes spent
  description: String,              // "What did you work on?"
  taskId: ObjectId,                 // Optional linked task
  focusQuality: Number,             // 1-10 rating
  productivityRating: Number,       // 1-10 rating
  breakType: String,                // "short" | "long" | "lunch" | "exercise"
  tags: [String],                   // Custom tags
  createdAt: Date,
  updatedAt: Date
}
```

### Daily Time Summary
```javascript
{
  study: {
    duration: 180,      // 3h 0m (in minutes)
    focus: 7.5,         // Average focus quality
    productivity: 8.0,   // Average productivity rating
    sessions: 3         // Number of sessions
  },
  work: {
    duration: 240,      // 4h 0m (in minutes)
    focus: 6.8,
    productivity: 7.2,
    sessions: 2
  },
  totalDuration: 420,   // 7h 0m total
  overallFocus: 7.2,
  overallProductivity: 7.6
}
```

## 📊 Productivity Score Calculation

### DayScore Model (`server/models/DayScore.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  
  // Component scores (0-100)
  scores: {
    productivity: 75,    // Based on tasks + time tracking
    health: 82,         // Sleep, steps, exercise
    focus: 68,          // Screen time, distractions
    mood: 79            // Mood ratings, stress levels
  },
  
  overallScore: 76,     // Weighted average
  
  // Detailed breakdown for transparency
  breakdown: {
    productivity: {
      tasksCompleted: 4,
      taskCompletionRate: 66.7,  // 4/6 tasks
      studyTime: 180,            // 3 hours
      workTime: 240,             // 4 hours
      productivityRating: 7.5
    },
    health: {
      sleepDuration: 7.2,
      sleepQuality: 8,
      steps: 8500,
      activeMinutes: 45,
      exerciseTime: 30
    },
    focus: {
      screenTime: 320,           // 5.3 hours total
      productiveScreenTime: 180, // 3 hours productive
      distractions: 8,
      focusQuality: 6.8
    },
    mood: {
      moodRating: 4,    // 1-5 scale
      energyLevel: 7,   // 1-10 scale
      stressLevel: 4,   // 1-10 scale (lower is better)
      wellnessScore: 79
    }
  },
  
  // Goals achievement tracking
  goalsAchieved: {
    studyHours: true,     // Met 3+ hour goal
    workHours: true,      // Met work time goal
    sleepHours: false,    // Didn't meet 8 hour sleep goal
    steps: false,         // Didn't meet 10k steps
    tasksCompleted: true  // Completed priority tasks
  }
}
```

## 🎯 Productivity Score Algorithm

### Task Completion Component (40% of productivity score)
```javascript
// Task completion with diminishing returns
taskRate = tasksCompleted / totalTasks;
taskScore = 40 * (1 - Math.exp(-2 * taskRate));

// Weighted by task importance
weightedCompletion = completedScoreImpact / totalScoreImpact;
```

### Time Management Component (30% of productivity score)
```javascript
// Time spent vs goals
totalTime = studyTime + workTime;
targetTime = (studyHoursGoal + workHoursGoal) * 60;
timeRatio = totalTime / targetTime;

// Optimal zone: 80-120% of target
if (0.8 <= timeRatio <= 1.2) {
  timeScore = 30 * (1 - Math.abs(timeRatio - 1) / 0.2);
} else {
  timeScore = 30 * Math.exp(-Math.abs(timeRatio - 1));
}
```

### Quality Ratings Component (30% of productivity score)
```javascript
qualityScore = (
  avgProductivityRating * 0.6 + 
  avgFocusQuality * 0.4
) / 10 * 30;
```

## 📱 UI Data Display

### Task Assignments Widget (from your image)
```javascript
// Visual representation
{
  title: "Task Assignments",
  stats: {
    todo: { count: 2, color: "blue" },
    inProgress: { count: 3, color: "orange" }, 
    done: { count: 1, color: "green" }
  },
  recentTasks: [
    {
      title: "Design New Landing Page",
      dueDate: "Jan 26",
      status: "in-progress",
      priority: "high"
    },
    {
      title: "Prepare Presentation", 
      dueDate: "Jan 29",
      status: "todo",
      priority: "medium"
    },
    {
      title: "Study JavaScript",
      dueDate: "Jan 25", 
      status: "in-progress",
      priority: "high"
    }
  ]
}
```

### Time Tracker Widget
```javascript
{
  title: "Time Tracker",
  todaysSummary: {
    study: "3h 0m",
    work: "4h 0m", 
    entertainment: "1h 30m",
    total: "8h 30m"
  },
  activeSession: {
    type: "study",
    currentTime: "00:25:30",
    status: "running"
  },
  recentSessions: [
    { type: "study", duration: "45m", description: "JavaScript concepts" },
    { type: "work", duration: "2h 15m", description: "Landing page design" },
    { type: "study", duration: "1h 30m", description: "React components" }
  ]
}
```

## 🔄 Data Flow

1. **Task Creation** → Task Model → Update completion stats
2. **Time Tracking** → TimeLog Model → Calculate daily time summary  
3. **Daily Calculation** → Aggregate tasks + time → Generate DayScore
4. **AI Analysis** → Process DayScore → Generate insights & recommendations
5. **UI Display** → Fetch aggregated data → Show widgets & charts

## 📈 Analytics & Insights

### Weekly Trends
```javascript
{
  weeklyStats: {
    averageProductivity: 76.2,
    taskCompletionRate: 68.5,
    totalStudyTime: 1260,  // 21 hours
    totalWorkTime: 1680,   // 28 hours
    bestDay: { date: "2024-01-22", score: 85 },
    improvementAreas: ["focus", "sleep"]
  }
}
```

This comprehensive data structure powers your task management and productivity tracking system, providing detailed insights while maintaining a clean, user-friendly interface.
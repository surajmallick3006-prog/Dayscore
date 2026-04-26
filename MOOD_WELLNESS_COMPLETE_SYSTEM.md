# 🧠 Complete Mood & Wellness System - Code & Logic Structure

## System Overview

The DayScore Mood & Wellness system is a comprehensive emotional intelligence platform that tracks, analyzes, and provides therapeutic support for users' mental health and emotional well-being.

## 🏗️ Architecture Components

### 1. Core Components
- **MoodPage.js** - Main mood tracking interface
- **MoodSlider.js** - Dashboard mood display component  
- **dayScoreService.js** - Real-time score calculation
- **aiService.js** - Emotional AI support system
- **Firebase Integration** - Data persistence and real-time sync

### 2. Data Flow Architecture
```
User Input → Mood Analysis → Score Calculation → AI Response → Data Storage → Dashboard Display
```

## 📊 Complete Code Structure

### A. MoodPage.js - Main Tracking Interface

#### Core State Management
```javascript
const [selectedMood, setSelectedMood] = useState(3);      // 1-5 scale
const [energy, setEnergy] = useState(7);                 // 1-10 scale  
const [stress, setStress] = useState(4);                 // 1-10 scale
const [notes, setNotes] = useState('');                  // User reflection
const [moodEntries, setMoodEntries] = useState([]);      // Historical data
const [showConsolingPopup, setShowConsolingPopup] = useState(false);
const [consolingMessage, setConsolingMessage] = useState('');
```

#### Mood Configuration
```javascript
const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
```

### B. Advanced Score Calculation Algorithm

#### 1. Mood Score Calculation (0-100)
```javascript
const calculateMoodWellnessScores = (mood, energy, stress, notes) => {
  // Base mood score (0-100)
  const baseMoodScore = (mood - 1) * 25; // Convert 1-5 to 0-100
  
  // Energy contribution (0-30 points)
  const energyScore = (energy / 10) * 30;
  
  // Stress penalty (0-25 points deducted)
  const stressPenalty = (stress / 10) * 25;
  
  // Advanced note sentiment analysis
  let noteSentimentBonus = analyzeNoteSentiment(notes);
  
  // Final mood score
  const moodScore = Math.max(0, Math.min(100, 
    baseMoodScore + energyScore - stressPenalty + noteSentimentBonus
  ));
  
  return { moodScore, wellnessScore, categories, breakdown };
};
```

#### 2. Advanced Sentiment Analysis Engine
```javascript
const emotionalKeywords = {
  // High-intensity positive (weight: 4)
  highPositive: ['amazing', 'incredible', 'fantastic', 'wonderful', 'excellent', 
                 'outstanding', 'brilliant', 'perfect', 'thrilled', 'ecstatic'],
  
  // Medium-intensity positive (weight: 3)
  mediumPositive: ['happy', 'good', 'great', 'excited', 'grateful', 'blessed', 
                   'love', 'joy', 'peaceful', 'calm', 'accomplished', 'proud'],
  
  // High-intensity negative (weight: -4)
  highNegative: ['devastated', 'heartbroken', 'miserable', 'terrible', 'awful', 
                 'depressed', 'hopeless', 'desperate', 'overwhelmed', 'exhausted'],
  
  // Coping/resilience keywords (weight: 2)
  coping: ['trying', 'working', 'managing', 'dealing', 'coping', 'learning', 
           'growing', 'improving', 'better', 'healing', 'recovering'],
  
  // Support/connection keywords (weight: 3)
  support: ['family', 'friends', 'support', 'help', 'together', 'connected', 
            'loved', 'understood', 'listened', 'cared', 'supported']
};
```

#### 3. Wellness Score Calculation
```javascript
const wellnessScore = Math.max(0, Math.min(100,
  (mood * 12) +                    // Mood weight: 12 points per level (max 60)
  (energy * 4) +                  // Energy weight: 4 points per level (max 40)  
  ((10 - stress) * 3) +           // Stress weight: 3 points per level (max 30, inverted)
  (noteSentimentBonus * 1.5) +    // Note sentiment: enhanced weight
  10                              // Base wellness score
));
```

### C. Emotional AI Support System

#### 1. Therapeutic Message Generation
```javascript
const generateConsolingMessage = (mood, energyLevel, stressLevel, userNotes) => {
  const messages = {
    // Very Sad (1) - Deep emotional validation
    1: {
      low_energy_high_stress: "My heart goes out to you right now. I can feel the weight you're carrying, and I want you to know that your pain is real and it matters. You don't have to be strong for anyone right now...",
      
      low_energy_low_stress: "I can sense the deep sadness in your heart, and I want you to know that I see you. Your feelings are so valid, and there's nothing wrong with feeling this way...",
      
      // ... (complete message matrix for all mood/energy/stress combinations)
    },
    
    // Happy (4) - Celebrating joy
    4: {
      high_energy_low_stress: "Oh, what beautiful energy you have today! Your happiness is infectious, your spirit is bright, and there's something absolutely radiant about you right now..."
    }
  };
  
  // Determine energy and stress categories
  const energyCategory = energyLevel <= 5 ? 'low' : 'high';
  const stressCategory = stressLevel <= 5 ? 'low' : 'high';
  const key = `${energyCategory}_energy_${stressCategory}_stress`;
  
  return messages[mood]?.[key] || messages[3][key];
};
```

#### 2. Personalized Message Enhancement
```javascript
if (userNotes && userNotes.trim().length > 0) {
  const personalizedAddition = "\n\nI can feel the depth of your heart in the words you've shared. Thank you for trusting me with your inner world - your thoughts, your feelings, your truth...";
  baseMessage += personalizedAddition;
}
```

### D. Data Persistence & Storage

#### 1. Local Storage Structure
```javascript
const newEntry = {
  id: Date.now(),
  date: dateString,                    // YYYY-MM-DD format
  dateDisplay: today.toLocaleDateString(),
  mood: selectedMood,                  // 1-5 scale
  moodEmoji: moodEmojis[selectedMood - 1],
  moodLabel: moodLabels[selectedMood - 1],
  energy: energy,                      // 1-10 scale
  stress: stress,                      // 1-10 scale
  notes: notes.trim(),
  timestamp: today.toISOString(),
  
  // Calculated scores
  moodScore: scores.moodScore,         // 0-100
  wellnessScore: scores.wellnessScore, // 0-100
  moodCategory: scores.moodCategory,   // Text category
  wellnessCategory: scores.wellnessCategory,
  scoreBreakdown: scores.breakdown     // Detailed breakdown
};
```

#### 2. Dashboard Integration Data
```javascript
localStorage.setItem('latestMoodWellnessScores', JSON.stringify({
  moodScore: scores.moodScore,
  wellnessScore: scores.wellnessScore,
  moodCategory: scores.moodCategory,
  wellnessCategory: scores.wellnessCategory,
  date: dateString,
  timestamp: today.toISOString(),
  
  // Wellness components breakdown for dashboard
  wellnessComponents: {
    mood: {
      value: selectedMood,
      score: selectedMood * 20,
      emoji: moodEmojis[selectedMood - 1],
      label: moodLabels[selectedMood - 1]
    },
    energy: {
      value: energy,
      score: energy * 10,
      percentage: energy * 10
    },
    stressManagement: {
      value: stress,
      score: (10 - stress) * 10,
      percentage: (10 - stress) * 10
    }
  }
}));
```

### E. Firebase Integration (dayScoreService.js)

#### 1. Mood Data Fetching
```javascript
// Fetch mood data for today
const moodRef = collection(db, 'users', userId, 'moodLogs');
const moodQuery = query(
  moodRef,
  where('date', '>=', Timestamp.fromDate(startOfDay)),
  where('date', '<=', Timestamp.fromDate(endOfDay)),
  orderBy('date', 'desc'),
  limit(1)
);
const moodSnapshot = await getDocs(moodQuery);
const moodData = moodSnapshot.docs.length > 0 ? moodSnapshot.docs[0].data() : null;
```

#### 2. Wellness Score Integration
```javascript
calculateWellnessScore(moodData) {
  let score = 50; // Base score
  
  if (!moodData) return score;
  
  // Mood level (40% of score)
  if (moodData.mood !== undefined) {
    const moodScore = (moodData.mood / 5) * 40;
    score += moodScore;
  }
  
  // Energy level (30% of score)
  if (moodData.energy !== undefined) {
    const energyScore = (moodData.energy / 10) * 30;
    score += energyScore;
  }
  
  // Stress management (20% of score) - inverted
  if (moodData.stress !== undefined) {
    const stressScore = ((10 - moodData.stress) / 10) * 20;
    score += stressScore;
  }
  
  // Gratitude/positivity (10% of score)
  if (moodData.gratitude && moodData.gratitude.length > 0) {
    score += 10;
  } else if (moodData.notes && moodData.notes.length > 20) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}
```

## 🎨 UI/UX Components

### 1. Mood Selector Interface
```javascript
{moodEmojis.map((emoji, index) => (
  <button
    key={index}
    onClick={() => setSelectedMood(index + 1)}
    className={`text-5xl p-4 rounded-full transition-all duration-200 ${
      selectedMood === index + 1
        ? 'bg-purple-100 scale-110 shadow-xl ring-4 ring-purple-200'
        : 'hover:bg-gray-50 hover:scale-105'
    }`}
  >
    {emoji}
  </button>
))}
```

### 2. Dynamic Slider Components
```javascript
// Energy Level Slider
<input
  type="range"
  min="1"
  max="10"
  value={energy}
  onChange={(e) => setEnergy(parseInt(e.target.value))}
  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
  style={{
    background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(energy-1)*11.11}%, #e5e7eb ${(energy-1)*11.11}%, #e5e7eb 100%)`
  }}
/>
```

### 3. Real-time Score Display
```javascript
<div className="grid grid-cols-2 gap-6 mb-6">
  {/* Mood Score */}
  <div className="text-center">
    <div className="text-4xl font-bold text-purple-600 mb-2">
      {currentScores.moodScore}
    </div>
    <div className="text-sm text-purple-700 font-medium mb-2">Mood Score</div>
    <div className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
      {currentScores.moodCategory}
    </div>
  </div>
  
  {/* Wellness Score */}
  <div className="text-center">
    <div className="text-4xl font-bold text-pink-600 mb-2">
      {currentScores.wellnessScore}
    </div>
    <div className="text-sm text-pink-700 font-medium mb-2">Wellness Score</div>
    <div className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
      {currentScores.wellnessCategory}
    </div>
  </div>
</div>
```

## 📅 Calendar & Visualization

### 1. Monthly Calendar Integration
```javascript
const getCalendarDays = () => {
  const { startDate, currentMonth } = getCurrentMonthData();
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const moodEntry = moodEntries.find(entry => entry.date === dateString);
    
    days.push({
      date: date.getDate(),
      fullDate: date,
      dateString,
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: date.toDateString() === today.toDateString(),
      moodEntry
    });
  }
  
  return days;
};
```

### 2. Trend Visualization
```javascript
// Monthly Mood Trend Chart
{Array.from({ length: 7 }, (_, i) => {
  const weekEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (6 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
  
  const avgMood = weekEntries.length > 0 
    ? weekEntries.reduce((acc, entry) => acc + entry.mood, 0) / weekEntries.length 
    : 3;
  
  return (
    <div key={i} className="flex flex-col items-center flex-1">
      <div 
        className="w-full bg-gradient-to-t from-purple-200 to-purple-400 rounded-t mb-2"
        style={{ height: `${(avgMood / 5) * 60 + 15}px` }}
      />
      <span className="text-sm text-gray-600">W{i + 1}</span>
    </div>
  );
})}
```

## 🔄 Integration Points

### 1. Dashboard Integration (Dashboard.js)
```javascript
// Real-time mood data display
{(() => {
  if (moodData && moodData.length > 0) {
    const latestMood = moodData[0];
    const components = getDayScoreComponents();
    
    return (
      <div className="space-y-4">
        {/* Mood and wellness score display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {latestMood.mood ? latestMood.mood * 20 : components.wellness}
            </div>
            <div className="text-sm text-purple-700 font-medium mb-1">Mood Score</div>
          </div>
          
          <div className="text-center p-4 bg-pink-50 rounded-xl">
            <div className="text-3xl font-bold text-pink-600 mb-1">
              {components.wellness}
            </div>
            <div className="text-sm text-pink-700 font-medium mb-1">Wellness Score</div>
          </div>
        </div>
      </div>
    );
  }
})()}
```

### 2. AI Service Integration
```javascript
// AI popup system considers mood data
const shouldTriggerAI = (context) => {
  const { mood, dayScore } = context;
  
  // PRIORITY: Emotional support for low mood
  if (mood <= 4) return 'console';
  if (mood <= 6 && dayScore < 40) return 'console';
  
  // High mood deserves recognition
  if (mood >= 8) return 'praise';
  
  return null;
};
```

## 📊 Analytics & Insights

### 1. Wellness Metrics Calculation
```javascript
// Mood stability calculation
const moodStability = Math.round(85 - (moodEntries.slice(0, 7).reduce((acc, entry) => 
  acc + Math.abs(entry.mood - 3), 0) / Math.min(moodEntries.length, 7)) * 10);

// Energy levels average
const energyLevels = Math.round((moodEntries.slice(0, 7).reduce((acc, entry) => 
  acc + entry.energy, 0) / Math.min(moodEntries.length, 7)) * 10);

// Stress management score
const stressManagement = Math.round(100 - (moodEntries.slice(0, 7).reduce((acc, entry) => 
  acc + entry.stress, 0) / Math.min(moodEntries.length, 7)) * 10);
```

### 2. Historical Analysis
```javascript
// Overall wellness calculation
const overallWellness = moodEntries.length > 0 
  ? Math.round(moodEntries.slice(0, 7).reduce((acc, entry) => 
      acc + (entry.wellnessScore || 75), 0) / Math.min(moodEntries.length, 7))
  : 78;
```

## 🎯 Key Features

### 1. **Therapeutic AI Support**
- Context-aware emotional messages
- Mood-specific consolation
- Therapeutic language patterns
- Emotional validation focus

### 2. **Advanced Analytics**
- Multi-factor score calculation
- Sentiment analysis of notes
- Trend visualization
- Historical pattern recognition

### 3. **Real-time Integration**
- Dashboard wellness display
- Day score contribution
- AI trigger system
- Live score updates

### 4. **Data Persistence**
- Local storage backup
- Firebase cloud sync
- Historical data retention
- Cross-device accessibility

### 5. **User Experience**
- Intuitive mood selection
- Visual feedback systems
- Calendar integration
- Progress tracking

## 🔧 Technical Architecture

### Data Flow:
1. **User Input** → Mood, Energy, Stress, Notes
2. **Score Calculation** → Advanced algorithms with sentiment analysis
3. **AI Analysis** → Therapeutic message generation
4. **Data Storage** → Local + Firebase persistence
5. **Dashboard Integration** → Real-time wellness display
6. **Historical Analysis** → Trends and patterns

### Performance Optimizations:
- Real-time score calculation
- Efficient local storage
- Optimized Firebase queries
- Responsive UI updates
- Smart caching strategies

This comprehensive mood and wellness system provides users with professional-level emotional intelligence tracking, therapeutic AI support, and meaningful insights into their mental health patterns.
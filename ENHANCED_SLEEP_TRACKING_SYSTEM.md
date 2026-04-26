# Enhanced Sleep Tracking System - DayScore Project

## 🌙 Overview
The enhanced sleep tracking system now includes comprehensive meal consumption tracking, 24-hour time format (00:00), and automatic sleep duration calculation based on the sleep time tracker.

## ✨ New Features Implemented

### 1. **24-Hour Time Format (00:00)**
- **Bedtime Selection**: Choose from 20:00 to 08:00 (8 PM to 8 AM)
- **Dinner Time Selection**: Choose from 17:00 to 22:00 (5 PM to 10 PM)
- **Automatic Conversion**: Times are stored and displayed in 24-hour format
- **User-Friendly Interface**: Clean time picker with relevant time ranges

### 2. **Comprehensive Meal Consumption Tracking**
- **Four Meal Categories**:
  - 🍳 **Breakfast** (Default: 08:00)
  - 🍎 **Lunch** (Default: 13:00)
  - 🍽️ **Dinner** (Default: 20:00)
  - 🥤 **Snacks** (Default: 16:00)

- **Meal Features**:
  - ✅ **Consumption Toggle**: Mark meals as consumed/not consumed
  - 🕐 **Time Tracking**: Record when meals were consumed
  - 📝 **Item Tracking**: Add specific food items to each meal
  - 🗑️ **Item Management**: Remove items from meals
  - 📊 **Daily Summary**: Overview of meal consumption status

### 3. **Automatic Sleep Duration Calculation**
- **Real-Time Tracking**: Live sleep duration updates during tracking
- **Automatic Bedtime**: Sets bedtime when sleep tracking starts
- **Automatic Wake Time**: Records wake time when tracking stops
- **Duration Calculation**: Automatically calculates sleep duration based on actual tracking
- **Session History**: Stores detailed sleep sessions with bedtime/wake time data

### 4. **Enhanced Sleep Time Tracker**
- **Live Duration Display**: Real-time sleep duration updates
- **Improved Session Data**: Includes bedtime, wake time, and calculated duration
- **Better Session History**: Shows actual sleep times vs tracking times
- **Persistent Data**: All data saves to localStorage

## 🎯 How It Works

### **Setting Bedtime and Dinner Time**
1. Click on the bedtime or dinner time display
2. Select from filtered time options in 24-hour format
3. Times automatically save and update meal consumption data
4. AI insights adjust based on timing gap between meals and sleep

### **Meal Consumption Tracking**
1. **Toggle Consumption**: Click the circle button to mark meals as consumed
2. **Add Items**: Click "+ [Item]" buttons to add food items to meals
3. **Remove Items**: Click "×" next to items to remove them
4. **View Summary**: Check daily meal consumption overview
5. **Time Recording**: Consumption time is automatically recorded

### **Sleep Tracking Process**
1. **Start Tracking**: Click "Start Sleep" - automatically sets bedtime to current time
2. **Live Updates**: Sleep duration updates in real-time
3. **Pause/Resume**: Pause and resume tracking as needed
4. **Stop & Save**: Click "Stop & Save" to:
   - Record wake time
   - Calculate final sleep duration
   - Update main sleep data
   - Save session to history

### **Automatic Duration Calculation**
```javascript
// Example calculation
Bedtime: 23:30 (11:30 PM)
Wake Time: 07:00 (7:00 AM)
Calculated Duration: 7h 30m

// Handles overnight sleep automatically
```

## 📊 Data Structure

### **Sleep Data**
```javascript
{
  duration: "7h 30m",           // Calculated or manual
  quality: "Good",              // Sleep quality rating
  bedtime: "23:30",            // 24-hour format
  dinnertime: "20:00",         // 24-hour format
  score: 85,                   // Sleep score
  goal: 8,                     // Sleep goal in hours
  actualSleepTime: "7h 30m",   // From live tracking
  wakeUpTime: "07:00"          // Recorded wake time
}
```

### **Meal Consumption Data**
```javascript
{
  breakfast: {
    consumed: true,
    time: "08:00",
    items: ["Oatmeal", "Coffee"],
    consumedAt: "8:15:30 AM"
  },
  lunch: {
    consumed: false,
    time: "13:00",
    items: [],
    consumedAt: null
  },
  // ... dinner, snacks
}
```

### **Sleep Session Data**
```javascript
{
  id: 1706123456789,
  date: "1/24/2024",
  duration: 27000,              // Seconds
  startTime: "11:30:00 PM",     // Tracking start
  endTime: "7:00:00 AM",        // Tracking end
  stage: "Deep Sleep",
  bedtime: "23:30",             // Actual bedtime
  wakeTime: "07:00",            // Actual wake time
  calculatedDuration: "7h 30m"  // Calculated duration
}
```

## 🧠 AI Insights Enhancement

The AI insights now provide intelligent feedback based on:

### **Meal-Sleep Timing Analysis**
- **Optimal Gap**: Recommends 3+ hours between dinner and bedtime
- **Quality Impact**: Calculates potential sleep quality improvement
- **Personalized Advice**: Adjusts recommendations based on actual times

### **Example AI Insights**
```
✅ Perfect! Having dinner at 20:00 and sleeping at 23:30 gives your body 3.5 hours to digest. This can improve your sleep quality by 14%.

⚠️ Consider having dinner earlier. Currently 2 hours between dinner (21:00) and bedtime (23:00) may affect sleep quality. Aim for 3+ hours gap.
```

### **Meal Consumption Tracking**
- Shows daily meal consumption progress (e.g., "Meals consumed today: 3/4")
- Displays live sleep duration when tracking is active

## 🎨 User Interface Improvements

### **Visual Enhancements**
- **Live Tracking Indicator**: Shows "Live Tracking" when sleep tracking is active
- **Meal Icons**: Different icons for each meal type (Coffee, Apple, Utensils, Droplets)
- **Consumption Status**: Visual checkmarks and progress indicators
- **Time Format**: Consistent 24-hour format throughout
- **Color Coding**: Orange theme with status-based colors

### **Interactive Elements**
- **Expandable Sections**: Show/hide meal tracker and sleep tracker
- **Quick Actions**: One-click meal consumption toggle
- **Item Management**: Easy add/remove food items
- **Time Selection**: Filtered time options for relevant ranges

## 📱 Mobile Responsiveness
- **Grid Layouts**: Responsive grid for different screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Scrollable Areas**: Proper scrolling for long lists
- **Compact Design**: Efficient use of screen space

## 💾 Data Persistence
All data is automatically saved to localStorage:
- **Sleep Data**: Main sleep information and preferences
- **Meal Consumption**: Daily meal tracking data
- **Sleep Sessions**: Historical sleep tracking sessions
- **User Preferences**: UI state and settings

## 🔄 Real-Time Updates
- **Live Sleep Duration**: Updates every second during tracking
- **Automatic Calculations**: Duration recalculates when times change
- **Instant Feedback**: AI insights update immediately
- **Session Persistence**: Data survives page refreshes

## 🎯 Usage Instructions

### **For Users**
1. **Set Your Schedule**: Choose your preferred bedtime and dinner time
2. **Track Meals**: Mark meals as consumed and add specific items
3. **Start Sleep Tracking**: Use the sleep tracker for accurate duration measurement
4. **Review Insights**: Check AI recommendations for optimal timing
5. **Monitor Progress**: View sleep session history and trends

### **For Developers**
1. **Data Access**: All data is stored in localStorage with clear structure
2. **Extensibility**: Easy to add new meal types or tracking features
3. **API Integration**: Ready for backend integration when available
4. **Customization**: Configurable time ranges and meal options

## 🚀 Future Enhancements (Roadmap)
- **Smart Notifications**: Remind users about meal times and bedtime
- **Sleep Quality Scoring**: Advanced algorithms based on meal timing
- **Weekly/Monthly Reports**: Comprehensive sleep and meal analytics
- **Integration**: Connect with fitness trackers and health apps
- **Social Features**: Share progress with friends or family
- **Custom Meal Types**: User-defined meal categories and times

## ✅ Testing Checklist
- [ ] Set bedtime in 24-hour format
- [ ] Set dinner time in 24-hour format
- [ ] Mark meals as consumed
- [ ] Add and remove meal items
- [ ] Start sleep tracking
- [ ] Pause and resume tracking
- [ ] Stop tracking and verify duration calculation
- [ ] Check AI insights update based on timing
- [ ] Verify data persistence across page refreshes
- [ ] Test responsive design on different screen sizes

The enhanced sleep tracking system provides a comprehensive solution for monitoring sleep patterns, meal consumption, and their interconnected effects on overall health and well-being.
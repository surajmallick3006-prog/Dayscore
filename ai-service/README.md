# 🧠 DayScore AI Service - Python Edition

Advanced AI analytics service for student productivity and wellness analysis using Python, FastAPI, and machine learning.

## 🚀 Features

### Advanced AI Capabilities
- **Sophisticated Scoring Algorithms**: Non-linear scaling, optimal zones, and diminishing returns
- **Burnout Risk Assessment**: Multi-indicator analysis with trend detection
- **Intelligent Day Classification**: PUSH/BALANCED/RECOVERY based on energy patterns
- **Pattern Recognition**: Weekly trend analysis and performance optimization
- **Context-Aware Insights**: Personalized recommendations using historical data

### Machine Learning Components
- **Statistical Analysis**: Scipy for trend analysis and correlation detection
- **Clustering**: Scikit-learn for pattern identification
- **Predictive Modeling**: Performance forecasting and optimization
- **Data Processing**: Pandas and NumPy for efficient data manipulation

## 📋 Requirements

- Python 3.8+
- FastAPI
- NumPy & Pandas
- Scikit-learn
- Scipy
- Uvicorn

## 🛠️ Installation & Setup

### Option 1: Quick Start (Recommended)
```bash
cd ai-service
python start.py
```

### Option 2: Manual Setup
```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 API Endpoints

### Health Check
```
GET http://localhost:8000/
GET http://localhost:8000/health
```

### AI Analysis
```
POST http://localhost:8000/analyze
GET http://localhost:8000/demo-analysis
```

### Insights
```
GET http://localhost:8000/insights/burnout-patterns
GET http://localhost:8000/insights/optimal-performance
```

## 📊 API Usage Examples

### Demo Analysis
```bash
curl http://localhost:8000/demo-analysis
```

### Custom Analysis
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile": {
      "score_weights": {"productivity": 0.30, "health": 0.25, "focus": 0.25, "mood": 0.20},
      "daily_goals": {"study_hours": 4, "work_hours": 8, "sleep_hours": 8, "steps": 10000}
    },
    "today_data": {
      "productivity": {"tasks_completed": 4, "total_tasks": 6, "study_time": 180, "work_time": 240, "avg_productivity_rating": 7.5, "avg_focus_quality": 6.8},
      "health": {"sleep_duration": 7.2, "sleep_quality": 8, "steps": 8500, "active_minutes": 45, "exercise_duration": 30},
      "screen_time": {"total_screen_time": 320, "categories": {"productivity": 180, "social": 60, "entertainment": 80, "communication": 40}, "distractions": {"count": 8}},
      "mood": {"mood": 4, "energy": 7, "stress": 4, "motivation": 8, "anxiety": 3}
    },
    "historical_data": []
  }'
```

## 🧮 Advanced Algorithms

### Productivity Scoring
- **Exponential Task Completion**: `40 * (1 - exp(-2 * task_rate))`
- **Optimal Time Zone**: 80-120% of target time for maximum score
- **Quality Weighting**: Productivity (60%) + Focus (40%)

### Health Scoring
- **Sleep Optimization**: Peak scoring for 7-9 hours
- **Activity Integration**: Steps + active minutes + exercise
- **Recovery Consideration**: Sleep debt and quality factors

### Focus Scoring
- **Attention Residue**: Penalty for context switching
- **Productive Ratio**: Productive vs distracting screen time
- **Distraction Management**: Exponential penalty for interruptions

### Mood Scoring
- **Synergy Effects**: Bonus when all positive indicators align
- **Compounding Stress**: Penalty amplification for high stress + anxiety
- **Psychological Balance**: Positive affect vs negative affect

## 🔍 Burnout Risk Assessment

### Risk Factors (Weighted)
- Sleep deficit accumulation (2 points)
- Declining sleep trend (1 point)
- High stress levels >7/10 (2 points)
- Increasing stress trend (1 point)
- Productivity decline (1 point)
- Low activity + high screen time (1 point)

### Classification
- **HIGH**: 5+ risk points
- **MODERATE**: 3-4 risk points  
- **LOW**: <3 risk points

## 📈 Day Type Classification

### RECOVERY Day
- Average sleep <6.5 hours OR
- Average stress >7/10 OR
- Average day score <60 OR
- Today's energy <5/10

### PUSH Day
- Average sleep >7.5 hours AND
- Average stress <4/10 AND
- Average day score >80 AND
- High energy + motivation (>7/10) AND
- Good sleep quality (>7/10)

### BALANCED Day
- All other conditions

## 🎯 Integration with DayScore App

### Update Node.js Server
Add proxy endpoint in `server/index-simple.js`:

```javascript
// AI Service Proxy
app.get('/api/ai/python-analysis', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/demo-analysis');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});
```

### Update React Component
Modify `client/src/components/AIInsights.js`:

```javascript
const fetchAIAnalysis = async () => {
  try {
    const response = await axios.get('/api/ai/python-analysis');
    setAnalysis(response.data.analysis);
  } catch (err) {
    console.error('Failed to fetch Python AI analysis:', err);
  }
};
```

## 🔧 Development

### Project Structure
```
ai-service/
├── main.py              # FastAPI application
├── ai_analyzer.py       # Core AI analysis engine
├── requirements.txt     # Python dependencies
├── start.py            # Startup script
└── README.md           # This file
```

### Adding New Features
1. Extend `ai_analyzer.py` with new analysis methods
2. Add corresponding endpoints in `main.py`
3. Update Pydantic models for new data structures
4. Test with `/demo-analysis` endpoint

## 🧪 Testing

### Test Demo Analysis
```bash
# Start the service
python start.py

# In another terminal, test the API
curl http://localhost:8000/demo-analysis | python -m json.tool
```

### Expected Response
```json
{
  "day_score": 75,
  "day_type": "BALANCED",
  "burnout_risk": "LOW",
  "key_score_drivers": ["Exceptional health performance (82/100)"],
  "daily_insights": [
    "Strong health performance today - you're building positive momentum!",
    "Your excellent sleep and physical activity are clearly fueling your productivity - this is the power of holistic wellness!",
    "Try the 25-minute focused work blocks (Pomodoro technique) to strengthen your concentration muscle - your brain will thank you."
  ],
  "actionable_recommendations": [
    "⚖️ Maintain your current positive routines while making one small improvement",
    "📈 This is perfect for steady progress on medium-priority tasks",
    "👟 Aim for 8,000+ steps tomorrow - even short walks between tasks help significantly"
  ],
  "weekly_trend_insight": "Continue tracking for 7 days to unlock personalized weekly pattern insights and optimization recommendations."
}
```

## 🚀 Production Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```bash
export PYTHONPATH=/app
export AI_SERVICE_PORT=8000
export LOG_LEVEL=info
```

---

## 🎯 Why Python for AI?

**Advanced Libraries**: NumPy, Pandas, Scikit-learn for sophisticated analysis
**Statistical Power**: Scipy for trend analysis and correlation detection  
**Machine Learning**: Easy integration of ML models for pattern recognition
**Performance**: Optimized numerical computations for large datasets
**Scalability**: FastAPI provides high-performance async API framework
**Ecosystem**: Rich ecosystem of data science and AI tools

This Python-based AI service provides the sophisticated analysis capabilities that the DayScore project deserves! 🧠✨
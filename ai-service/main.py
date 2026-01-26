"""
DayScore AI Service - Python-based intelligent analysis system
Advanced analytics and machine learning for student wellness and productivity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from ai_analyzer import DayScoreAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DayScore AI Service",
    description="Advanced AI analytics for student productivity and wellness",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI analyzer
ai_analyzer = DayScoreAI()

# Pydantic models for request/response
class ProductivityData(BaseModel):
    tasks_completed: int = 0
    total_tasks: int = 1
    study_time: int = 0  # minutes
    work_time: int = 0   # minutes
    avg_productivity_rating: float = 5.0
    avg_focus_quality: float = 5.0

class HealthData(BaseModel):
    sleep_duration: float = 7.0  # hours
    sleep_quality: int = 5       # 1-10 scale
    steps: int = 5000
    active_minutes: int = 20
    exercise_duration: int = 0   # minutes

class ScreenTimeData(BaseModel):
    total_screen_time: int = 300  # minutes
    categories: Dict[str, int] = {
        "productivity": 120,
        "social": 60,
        "entertainment": 80,
        "communication": 40
    }
    distractions: Dict[str, int] = {"count": 10}

class MoodData(BaseModel):
    mood: int = 3          # 1-5 scale
    energy: int = 5        # 1-10 scale
    stress: int = 5        # 1-10 scale
    motivation: int = 5    # 1-10 scale
    anxiety: int = 5       # 1-10 scale

class TodayData(BaseModel):
    productivity: ProductivityData
    health: HealthData
    screen_time: ScreenTimeData
    mood: MoodData

class HistoricalDataPoint(BaseModel):
    date: str
    overall_score: int = 70
    scores: Dict[str, int] = {"productivity": 70, "health": 70, "focus": 70, "mood": 70}
    health: Optional[HealthData] = None
    mood: Optional[MoodData] = None
    productivity: Optional[ProductivityData] = None

class UserProfile(BaseModel):
    score_weights: Dict[str, float] = {
        "productivity": 0.30,
        "health": 0.25,
        "focus": 0.25,
        "mood": 0.20
    }
    daily_goals: Dict[str, Any] = {
        "study_hours": 4,
        "work_hours": 8,
        "sleep_hours": 8,
        "steps": 10000,
        "tasks_completed": 5
    }
    preferences: Dict[str, Any] = {"theme": "light"}

class AnalysisRequest(BaseModel):
    user_profile: UserProfile
    today_data: TodayData
    historical_data: List[HistoricalDataPoint] = []

class AIAnalysisResponse(BaseModel):
    day_score: int
    day_type: str  # PUSH, BALANCED, RECOVERY
    burnout_risk: str  # LOW, MODERATE, HIGH
    key_score_drivers: List[str]
    daily_insights: List[str]
    actionable_recommendations: List[str]
    weekly_trend_insight: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "DayScore AI Service is running",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "DayScore AI",
        "version": "1.0.0",
        "python_version": "3.x",
        "ai_engine": "ready",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_day(request: AnalysisRequest):
    """
    Analyze user's day data and provide AI insights
    """
    try:
        logger.info("Received analysis request")
        
        # Convert Pydantic models to dictionaries for processing
        user_data = {
            "user_profile": request.user_profile.dict(),
            "today_data": request.today_data.dict(),
            "historical_data": [item.dict() for item in request.historical_data]
        }
        
        # Run AI analysis
        analysis = ai_analyzer.analyze_day_score(user_data)
        
        logger.info(f"Analysis completed - Day Score: {analysis['day_score']}")
        
        return AIAnalysisResponse(**analysis)
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/demo-analysis", response_model=AIAnalysisResponse)
async def demo_analysis():
    """
    Generate demo AI analysis with sample student data
    """
    try:
        # Create realistic sample data for a student
        sample_data = {
            "user_profile": {
                "score_weights": {"productivity": 0.30, "health": 0.25, "focus": 0.25, "mood": 0.20},
                "daily_goals": {"study_hours": 4, "work_hours": 8, "sleep_hours": 8, "steps": 10000},
                "preferences": {"theme": "light"}
            },
            "today_data": {
                "productivity": {
                    "tasks_completed": 4,
                    "total_tasks": 6,
                    "study_time": 180,  # 3 hours
                    "work_time": 240,   # 4 hours
                    "avg_productivity_rating": 7.5,
                    "avg_focus_quality": 6.8
                },
                "health": {
                    "sleep_duration": 7.2,
                    "sleep_quality": 8,
                    "steps": 8500,
                    "active_minutes": 45,
                    "exercise_duration": 30
                },
                "screen_time": {
                    "total_screen_time": 320,  # 5.3 hours
                    "categories": {
                        "productivity": 180,
                        "social": 60,
                        "entertainment": 80,
                        "communication": 40
                    },
                    "distractions": {"count": 8}
                },
                "mood": {
                    "mood": 4,
                    "energy": 7,
                    "stress": 4,
                    "motivation": 8,
                    "anxiety": 3
                }
            },
            "historical_data": [
                {
                    "date": "2024-01-20",
                    "overall_score": 75,
                    "scores": {"productivity": 70, "health": 80, "focus": 75, "mood": 75},
                    "health": {"sleep_duration": 7.0, "steps": 9000},
                    "mood": {"stress": 5, "energy": 6}
                },
                {
                    "date": "2024-01-21", 
                    "overall_score": 82,
                    "scores": {"productivity": 85, "health": 78, "focus": 80, "mood": 85},
                    "health": {"sleep_duration": 8.0, "steps": 10500},
                    "mood": {"stress": 3, "energy": 8}
                },
                {
                    "date": "2024-01-22",
                    "overall_score": 68,
                    "scores": {"productivity": 65, "health": 70, "focus": 65, "mood": 72},
                    "health": {"sleep_duration": 6.5, "steps": 7500},
                    "mood": {"stress": 6, "energy": 5}
                }
            ]
        }
        
        # Run AI analysis on sample data
        analysis = ai_analyzer.analyze_day_score(sample_data)
        
        logger.info("Demo analysis generated successfully")
        
        return AIAnalysisResponse(**analysis)
        
    except Exception as e:
        logger.error(f"Demo analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo analysis failed: {str(e)}")

@app.get("/insights/burnout-patterns")
async def get_burnout_patterns():
    """
    Get insights about burnout patterns and prevention
    """
    return {
        "patterns": [
            "Sleep deficit accumulation over 3+ days",
            "Increasing stress levels with declining productivity",
            "High screen time (>8 hours) with low physical activity",
            "Consistent task overload without recovery periods"
        ],
        "early_warning_signs": [
            "Sleep duration dropping below 6.5 hours",
            "Stress levels consistently above 7/10",
            "Productivity ratings declining over time",
            "Mood and energy levels decreasing"
        ],
        "prevention_strategies": [
            "Maintain consistent sleep schedule (7.5+ hours)",
            "Schedule regular breaks and recovery activities",
            "Monitor and limit recreational screen time",
            "Practice stress management techniques",
            "Maintain physical activity routine"
        ]
    }

@app.get("/insights/optimal-performance")
async def get_optimal_performance_insights():
    """
    Get insights about optimal performance patterns
    """
    return {
        "peak_performance_indicators": [
            "7.5+ hours of quality sleep",
            "Balanced screen time (productive > recreational)",
            "Regular physical activity (8000+ steps)",
            "Moderate stress levels (3-5/10)",
            "High energy and motivation levels"
        ],
        "timing_recommendations": [
            "Tackle most challenging tasks in first 2-3 hours after waking",
            "Schedule breaks every 90 minutes during focused work",
            "Limit decision-making tasks when energy is low",
            "Plan recovery activities after high-intensity periods"
        ],
        "balance_strategies": [
            "Follow 80/20 rule: 80% productive screen time, 20% recreational",
            "Alternate between push days and balanced days",
            "Include at least one full recovery day per week",
            "Maintain consistent daily routines"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
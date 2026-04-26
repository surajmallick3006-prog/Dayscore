"""
DayScore AI Service - Python-based intelligent analysis system
Advanced analytics and machine learning for student wellness and productivity
Enhanced with real user data integration
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
import requests
import json
from ai_analyzer import DayScoreAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DayScore AI Service",
    description="Advanced AI analytics for student productivity and wellness with real user data",
    version="2.0.0"
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

# Node.js server URL for data fetching
NODE_SERVER_URL = "http://localhost:5000"

# File upload constants
MAX_FILE_SIZE = 256 * 1024  # 256KB limit
ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

# Pydantic models for request/response (keeping existing models)
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

class UserAnalysisRequest(BaseModel):
    user_id: str
    days: int = 30
    include_predictions: bool = True

class RealTimeAnalysisRequest(BaseModel):
    user_id: str
    date: Optional[str] = None  # YYYY-MM-DD format

# Helper function to fetch user data from Node.js server
async def fetch_user_data(user_id: str, endpoint: str, params: Dict = None):
    """Fetch user data from Node.js server"""
    try:
        url = f"{NODE_SERVER_URL}/api/data/{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        # Add user_id to params
        if params is None:
            params = {}
        params["user_id"] = user_id
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.warning(f"Failed to fetch {endpoint} for user {user_id}: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching {endpoint} for user {user_id}: {str(e)}")
        return None

async def get_comprehensive_user_data(user_id: str, days: int = 30):
    """Fetch comprehensive user data from all sources"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        params = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        }
        
        # Fetch all user data concurrently
        user_profile = await fetch_user_data(user_id, "profile", {})
        day_scores = await fetch_user_data(user_id, "day-scores", params)
        tasks = await fetch_user_data(user_id, "tasks", params)
        mood_logs = await fetch_user_data(user_id, "mood-logs", params)
        health_data = await fetch_user_data(user_id, "health-data", params)
        time_logs = await fetch_user_data(user_id, "time-logs", params)
        screen_time = await fetch_user_data(user_id, "screen-time", params)
        
        return {
            "user_profile": user_profile,
            "day_scores": day_scores or [],
            "tasks": tasks or [],
            "mood_logs": mood_logs or [],
            "health_data": health_data or [],
            "time_logs": time_logs or [],
            "screen_time": screen_time or [],
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching comprehensive user data: {str(e)}")
        return None

def validate_file_upload(file: UploadFile) -> Dict[str, Any]:
    """Validate uploaded file against size and type constraints"""
    errors = []
    
    # Check file size
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        errors.append(f"File size must be less than {MAX_FILE_SIZE // 1024}KB (256KB limit)")
    
    # Check file type
    if file.content_type and file.content_type not in ALLOWED_FILE_TYPES:
        errors.append("Only JPG, PNG, and GIF files are allowed")
    
    # Check filename extension
    if file.filename:
        extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
        if extension not in allowed_extensions:
            errors.append("Invalid file extension")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "file_info": {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": getattr(file, 'size', 0)
        }
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "DayScore AI Service v2.0 - Real User Data Analytics",
        "version": "2.0.0",
        "status": "healthy",
        "features": [
            "Real user data integration",
            "Dynamic personalized analytics",
            "Advanced pattern recognition",
            "Predictive insights"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "DayScore AI v2.0",
        "version": "2.0.0",
        "python_version": "3.x",
        "ai_engine": "ready",
        "data_integration": "active",
        "node_server": NODE_SERVER_URL,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/validate-file")
async def validate_file(file: UploadFile = File(...)):
    """
    Validate file upload against size and type constraints
    """
    try:
        # Read file to get actual size
        content = await file.read()
        file_size = len(content)
        
        # Reset file pointer
        await file.seek(0)
        
        # Create validation object with actual size
        validation_file = type('ValidationFile', (), {
            'filename': file.filename,
            'content_type': file.content_type,
            'size': file_size
        })()
        
        # Validate file
        validation_result = validate_file_upload(validation_file)
        
        logger.info(f"File validation: {file.filename} - {'Valid' if validation_result['is_valid'] else 'Invalid'}")
        
        return {
            "valid": validation_result["is_valid"],
            "errors": validation_result["errors"],
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": file_size,
                "size_formatted": f"{file_size / 1024:.1f}KB",
                "max_size_allowed": f"{MAX_FILE_SIZE / 1024}KB"
            }
        }
        
    except Exception as e:
        logger.error(f"File validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File validation failed: {str(e)}")

@app.get("/file-upload-limits")
async def get_file_upload_limits():
    """
    Get current file upload limits and constraints
    """
    return {
        "max_file_size": MAX_FILE_SIZE,
        "max_file_size_formatted": f"{MAX_FILE_SIZE / 1024}KB",
        "allowed_types": ALLOWED_FILE_TYPES,
        "allowed_extensions": ["jpg", "jpeg", "png", "gif"],
        "description": "File upload constraints for the DayScore AI system"
    }

@app.post("/analyze-user")
async def analyze_user_comprehensive(request: UserAnalysisRequest):
    """
    Comprehensive user analysis using real data
    """
    try:
        logger.info(f"Starting comprehensive analysis for user {request.user_id}")
        
        # Fetch real user data
        user_data = await get_comprehensive_user_data(request.user_id, request.days)
        
        if not user_data:
            # Fallback to demo analysis if data fetch fails
            logger.warning(f"Could not fetch user data for {request.user_id}, using demo analysis")
            return await demo_analysis()
        
        # Run comprehensive AI analysis with real data
        analysis = ai_analyzer.analyze_user_comprehensive(user_data)
        
        logger.info(f"Comprehensive analysis completed for user {request.user_id}")
        
        return {
            "user_id": request.user_id,
            "analysis_period": f"{request.days} days",
            "data_points_analyzed": {
                "day_scores": len(user_data.get("day_scores", [])),
                "tasks": len(user_data.get("tasks", [])),
                "mood_logs": len(user_data.get("mood_logs", [])),
                "health_records": len(user_data.get("health_data", [])),
                "time_logs": len(user_data.get("time_logs", [])),
                "screen_time_records": len(user_data.get("screen_time", []))
            },
            **analysis
        }
        
    except Exception as e:
        logger.error(f"User analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User analysis failed: {str(e)}")

@app.post("/analyze-realtime")
async def analyze_realtime(request: RealTimeAnalysisRequest):
    """
    Real-time analysis for a specific date using actual user data
    """
    try:
        logger.info(f"Starting real-time analysis for user {request.user_id}")
        
        # Use provided date or today
        target_date = datetime.fromisoformat(request.date) if request.date else datetime.now()
        
        # Fetch user data for the specific date and recent history
        user_data = await get_comprehensive_user_data(request.user_id, days=7)  # Get week context
        
        if not user_data:
            logger.warning(f"Could not fetch user data for {request.user_id}")
            raise HTTPException(status_code=404, detail="User data not found")
        
        # Run real-time analysis
        analysis = ai_analyzer.analyze_day_realtime(user_data, target_date)
        
        logger.info(f"Real-time analysis completed for user {request.user_id}")
        
        return {
            "user_id": request.user_id,
            "analysis_date": target_date.isoformat(),
            "real_time": True,
            **analysis
        }
        
    except Exception as e:
        logger.error(f"Real-time analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Real-time analysis failed: {str(e)}")

@app.get("/analytics/user-overview/{user_id}")
async def get_user_analytics_overview(user_id: str, period: str = "month"):
    """
    Get comprehensive analytics overview for a specific user using real data
    """
    try:
        days = 7 if period == "week" else 30
        
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days)
        
        if not user_data:
            logger.warning(f"Could not fetch user data for {user_id}, using fallback")
            return ai_analyzer.generate_analytics_overview(days)
        
        # Generate analytics with real user data
        analytics_data = ai_analyzer.generate_user_analytics_overview(user_data)
        
        logger.info(f"User analytics overview generated for {user_id}")
        
        return analytics_data
        
    except Exception as e:
        logger.error(f"User analytics overview failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User analytics failed: {str(e)}")

@app.get("/analytics/user-productivity/{user_id}")
async def get_user_productivity_trends(user_id: str, days: int = 30):
    """
    Get detailed productivity trends for a specific user
    """
    try:
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days)
        
        if not user_data:
            return ai_analyzer.analyze_productivity_trends(days)
        
        # Generate productivity analysis with real data
        trends_data = ai_analyzer.analyze_user_productivity_trends(user_data)
        
        logger.info(f"User productivity trends analyzed for {user_id}")
        
        return trends_data
        
    except Exception as e:
        logger.error(f"User productivity trends analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Productivity trends failed: {str(e)}")

@app.get("/analytics/user-health/{user_id}")
async def get_user_health_patterns(user_id: str, days: int = 30):
    """
    Get health and wellness pattern analysis for a specific user
    """
    try:
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days)
        
        if not user_data:
            return ai_analyzer.analyze_health_patterns(days)
        
        # Generate health analysis with real data
        health_data = ai_analyzer.analyze_user_health_patterns(user_data)
        
        logger.info(f"User health patterns analyzed for {user_id}")
        
        return health_data
        
    except Exception as e:
        logger.error(f"User health patterns analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health patterns failed: {str(e)}")

@app.get("/analytics/user-focus/{user_id}")
async def get_user_focus_analysis(user_id: str, days: int = 30):
    """
    Get detailed focus and attention analysis for a specific user
    """
    try:
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days)
        
        if not user_data:
            return ai_analyzer.analyze_focus_patterns(days)
        
        # Generate focus analysis with real data
        focus_data = ai_analyzer.analyze_user_focus_patterns(user_data)
        
        logger.info(f"User focus analysis completed for {user_id}")
        
        return focus_data
        
    except Exception as e:
        logger.error(f"User focus analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Focus analysis failed: {str(e)}")

@app.get("/analytics/user-mood/{user_id}")
async def get_user_mood_wellness_analysis(user_id: str, days: int = 30):
    """
    Get mood and wellness pattern analysis for a specific user
    """
    try:
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days)
        
        if not user_data:
            return ai_analyzer.analyze_mood_wellness(days)
        
        # Generate mood analysis with real data
        mood_data = ai_analyzer.analyze_user_mood_wellness(user_data)
        
        logger.info(f"User mood wellness analysis completed for {user_id}")
        
        return mood_data
        
    except Exception as e:
        logger.error(f"User mood wellness analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mood wellness failed: {str(e)}")

@app.get("/analytics/user-predictions/{user_id}")
async def get_user_performance_predictions(user_id: str):
    """
    Get AI-powered performance predictions for a specific user
    """
    try:
        # Fetch real user data for predictions
        user_data = await get_comprehensive_user_data(user_id, days=60)  # More data for better predictions
        
        if not user_data:
            return ai_analyzer.generate_performance_predictions()
        
        # Generate personalized predictions
        predictions = ai_analyzer.generate_user_performance_predictions(user_data)
        
        logger.info(f"User performance predictions generated for {user_id}")
        
        return predictions
        
    except Exception as e:
        logger.error(f"User performance predictions failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Performance predictions failed: {str(e)}")

@app.get("/analytics/user-weekly-report/{user_id}")
async def get_user_weekly_report(user_id: str):
    """
    Generate comprehensive weekly performance report for a specific user
    """
    try:
        # Fetch real user data for the past 2 weeks (for comparison)
        user_data = await get_comprehensive_user_data(user_id, days=14)
        
        if not user_data:
            return ai_analyzer.generate_weekly_report()
        
        # Generate personalized weekly report
        report = ai_analyzer.generate_user_weekly_report(user_data)
        
        logger.info(f"User weekly report generated for {user_id}")
        
        return report
        
    except Exception as e:
        logger.error(f"User weekly report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Weekly report failed: {str(e)}")

@app.get("/analytics/user-goals/{user_id}")
async def get_user_goal_tracking(user_id: str):
    """
    Get goal tracking and achievement analysis for a specific user
    """
    try:
        # Fetch real user data
        user_data = await get_comprehensive_user_data(user_id, days=30)
        
        if not user_data:
            return ai_analyzer.analyze_goal_progress()
        
        # Generate personalized goal analysis
        goal_data = ai_analyzer.analyze_user_goal_progress(user_data)
        
        logger.info(f"User goal tracking analysis completed for {user_id}")
        
        return goal_data
        
    except Exception as e:
        logger.error(f"User goal tracking failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Goal tracking failed: {str(e)}")

# Keep existing demo endpoints for backward compatibility
@app.get("/demo-analysis")
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
        
        return analysis
        
    except Exception as e:
        logger.error(f"Demo analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo analysis failed: {str(e)}")

# Keep existing generic endpoints for backward compatibility
@app.get("/analytics/overview")
async def get_analytics_overview(period: str = "month"):
    """Generic analytics overview (fallback)"""
    try:
        days = 7 if period == "week" else 30
        analytics_data = ai_analyzer.generate_analytics_overview(days)
        logger.info(f"Generic analytics overview generated for {period} period")
        return analytics_data
    except Exception as e:
        logger.error(f"Analytics overview failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics overview failed: {str(e)}")

# Continue with other generic endpoints...
@app.get("/analytics/productivity-trends")
async def get_productivity_trends(days: int = 30):
    """Generic productivity trends (fallback)"""
    try:
        trends_data = ai_analyzer.analyze_productivity_trends(days)
        logger.info(f"Generic productivity trends analyzed for {days} days")
        return trends_data
    except Exception as e:
        logger.error(f"Productivity trends analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Productivity trends failed: {str(e)}")

@app.get("/analytics/health-patterns")
async def get_health_patterns(days: int = 30):
    """Generic health patterns (fallback)"""
    try:
        health_data = ai_analyzer.analyze_health_patterns(days)
        logger.info(f"Generic health patterns analyzed for {days} days")
        return health_data
    except Exception as e:
        logger.error(f"Health patterns analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health patterns failed: {str(e)}")

@app.get("/analytics/focus-analysis")
async def get_focus_analysis(days: int = 30):
    """Generic focus analysis (fallback)"""
    try:
        focus_data = ai_analyzer.analyze_focus_patterns(days)
        logger.info(f"Generic focus analysis completed for {days} days")
        return focus_data
    except Exception as e:
        logger.error(f"Focus analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Focus analysis failed: {str(e)}")

@app.get("/analytics/mood-wellness")
async def get_mood_wellness_analysis(days: int = 30):
    """Generic mood wellness (fallback)"""
    try:
        mood_data = ai_analyzer.analyze_mood_wellness(days)
        logger.info(f"Generic mood wellness analysis completed for {days} days")
        return mood_data
    except Exception as e:
        logger.error(f"Mood wellness analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mood wellness failed: {str(e)}")

@app.get("/analytics/performance-predictions")
async def get_performance_predictions():
    """Generic performance predictions (fallback)"""
    try:
        predictions = ai_analyzer.generate_performance_predictions()
        logger.info("Generic performance predictions generated")
        return predictions
    except Exception as e:
        logger.error(f"Performance predictions failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Performance predictions failed: {str(e)}")

@app.get("/analytics/weekly-report")
async def get_weekly_report():
    """Generic weekly report (fallback)"""
    try:
        report = ai_analyzer.generate_weekly_report()
        logger.info("Generic weekly report generated")
        return report
    except Exception as e:
        logger.error(f"Weekly report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Weekly report failed: {str(e)}")

@app.get("/analytics/goal-tracking")
async def get_goal_tracking():
    """Generic goal tracking (fallback)"""
    try:
        goal_data = ai_analyzer.analyze_goal_progress()
        logger.info("Generic goal tracking analysis completed")
        return goal_data
    except Exception as e:
        logger.error(f"Goal tracking failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Goal tracking failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
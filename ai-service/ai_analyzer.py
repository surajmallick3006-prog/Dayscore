"""
DayScore AI Analyzer - Python-based analysis engine
Optimized for Python 3.14 compatibility
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class DayScoreAI:
    """
    AI analyzer for student daily effectiveness and wellness
    Optimized for Python 3.14 with minimal dependencies
    """
    
    def __init__(self):
        self.default_weights = {
            "productivity": 0.30,
            "health": 0.25,
            "focus": 0.25,
            "mood": 0.20
        }
        
        # Thresholds for various assessments
        self.burnout_thresholds = {
            "sleep_deficit": 6.5,
            "high_stress": 7.0,
            "low_productivity": 5.0,
            "high_screen_time": 480,  # 8 hours
            "low_activity": 5000
        }
        
        # Performance benchmarks
        self.performance_benchmarks = {
            "excellent": 90,
            "good": 75,
            "average": 60,
            "needs_improvement": 45
        }

    def analyze_day_score(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main analysis function - comprehensive day score analysis
        """
        try:
            user_profile = user_data["user_profile"]
            today_data = user_data["today_data"]
            historical_data = user_data.get("historical_data", [])
            
            # Calculate component scores using advanced algorithms
            component_scores = self._calculate_component_scores(today_data, user_profile)
            
            # Calculate weighted day score
            day_score = self._calculate_weighted_score(component_scores, user_profile)
            
            # Advanced pattern analysis
            burnout_risk = self._assess_burnout_risk_advanced(today_data, historical_data)
            day_type = self._classify_day_type_advanced(today_data, historical_data, component_scores)
            
            # Intelligent insight generation
            key_drivers = self._identify_key_drivers_advanced(component_scores)
            daily_insights = self._generate_intelligent_insights(
                today_data, component_scores, day_type, historical_data
            )
            recommendations = self._generate_smart_recommendations(
                today_data, day_type, burnout_risk, component_scores, historical_data
            )
            
            # Advanced trend analysis
            weekly_insight = self._analyze_weekly_trends_advanced(historical_data, component_scores)
            
            return {
                "day_score": int(day_score),
                "day_type": day_type,
                "burnout_risk": burnout_risk,
                "key_score_drivers": key_drivers,
                "daily_insights": daily_insights,
                "actionable_recommendations": recommendations,
                "weekly_trend_insight": weekly_insight
            }
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return self._get_fallback_analysis()

    def _calculate_component_scores(self, today_data: Dict, user_profile: Dict) -> Dict[str, float]:
        """
        Calculate component scores using advanced algorithms
        """
        productivity_score = self._calculate_productivity_score_advanced(
            today_data["productivity"], user_profile["daily_goals"]
        )
        
        health_score = self._calculate_health_score_advanced(
            today_data["health"], user_profile["daily_goals"]
        )
        
        focus_score = self._calculate_focus_score_advanced(
            today_data["screen_time"], today_data["productivity"]
        )
        
        mood_score = self._calculate_mood_score_advanced(today_data["mood"])
        
        return {
            "productivity": productivity_score,
            "health": health_score,
            "focus": focus_score,
            "mood": mood_score
        }

    def _calculate_productivity_score_advanced(self, prod_data: Dict, goals: Dict) -> float:
        """
        Advanced productivity scoring with non-linear scaling and context awareness
        """
        # Task completion with diminishing returns
        task_rate = prod_data["tasks_completed"] / max(prod_data["total_tasks"], 1)
        task_score = 40 * (1 - math.exp(-2 * task_rate))  # Exponential scaling
        
        # Time management with optimal zone consideration
        total_time = prod_data["study_time"] + prod_data["work_time"]
        target_time = (goals.get("study_hours", 4) + goals.get("work_hours", 8)) * 60
        
        # Optimal zone: 80-120% of target time
        time_ratio = total_time / max(target_time, 1)
        if 0.8 <= time_ratio <= 1.2:
            time_score = 30 * (1 - abs(time_ratio - 1) / 0.2)
        else:
            time_score = 30 * math.exp(-abs(time_ratio - 1))
        
        # Quality ratings with weighted average
        quality_score = (
            prod_data["avg_productivity_rating"] * 0.6 + 
            prod_data["avg_focus_quality"] * 0.4
        ) / 10 * 30
        
        return min(task_score + time_score + quality_score, 100)

    def _calculate_health_score_advanced(self, health_data: Dict, goals: Dict) -> float:
        """
        Advanced health scoring with sleep debt and recovery considerations
        """
        # Sleep score with optimal range consideration
        sleep_duration = health_data["sleep_duration"]
        target_sleep = goals.get("sleep_hours", 8)
        
        # Optimal sleep: 7-9 hours for most people
        if 7 <= sleep_duration <= 9:
            sleep_duration_score = 30 * (1 - abs(sleep_duration - target_sleep) / 2)
        else:
            sleep_duration_score = 30 * math.exp(-abs(sleep_duration - target_sleep) / 2)
        
        # Sleep quality with non-linear scaling
        sleep_quality_score = 30 * (health_data["sleep_quality"] / 10) ** 0.8
        
        # Activity score with step goals and active time
        steps = health_data["steps"]
        target_steps = goals.get("steps", 10000)
        steps_score = 25 * min(steps / target_steps, 1.5) ** 0.7  # Diminishing returns
        
        # Active minutes with exercise bonus
        active_total = health_data["active_minutes"] + health_data["exercise_duration"]
        activity_score = 15 * min(active_total / 60, 2) ** 0.6
        
        return min(sleep_duration_score + sleep_quality_score + steps_score + activity_score, 100)

    def _calculate_focus_score_advanced(self, screen_data: Dict, prod_data: Dict) -> float:
        """
        Advanced focus scoring with attention residue and context switching
        """
        total_screen = screen_data["total_screen_time"]
        categories = screen_data["categories"]
        
        # Productive vs distracting ratio with context switching penalty
        productive_time = categories.get("productivity", 0)
        distracting_time = categories.get("social", 0) + categories.get("entertainment", 0)
        
        if total_screen > 0:
            productive_ratio = productive_time / total_screen
            # Penalty for high context switching (many categories used)
            category_penalty = len([v for v in categories.values() if v > 30]) * 0.05
            ratio_score = 40 * max(productive_ratio - category_penalty, 0)
        else:
            ratio_score = 20  # Neutral score for no screen time
        
        # Distraction management with exponential penalty
        distraction_count = screen_data["distractions"]["count"]
        distraction_score = 30 * math.exp(-distraction_count / 10)
        
        # Focus quality from self-report with confidence weighting
        focus_quality = prod_data.get("avg_focus_quality", 5)
        focus_score = 30 * (focus_quality / 10) ** 0.9
        
        return min(ratio_score + distraction_score + focus_score, 100)

    def _calculate_mood_score_advanced(self, mood_data: Dict) -> float:
        """
        Advanced mood scoring with psychological well-being indicators
        """
        # Positive affect (mood, energy, motivation) with interaction effects
        mood = mood_data["mood"] / 5  # Normalize to 0-1
        energy = mood_data["energy"] / 10
        motivation = mood_data["motivation"] / 10
        
        # Synergy bonus when all positive indicators are high
        positive_synergy = 1 + 0.2 * min(mood, energy, motivation)
        positive_score = 50 * (mood * 0.4 + energy * 0.3 + motivation * 0.3) * positive_synergy
        
        # Negative affect (stress, anxiety) with compounding effects
        stress = mood_data["stress"] / 10
        anxiety = mood_data["anxiety"] / 10
        
        # Compounding penalty when both stress and anxiety are high
        negative_compound = 1 + 0.3 * stress * anxiety
        negative_penalty = 25 * (stress * 0.6 + anxiety * 0.4) * negative_compound
        
        return max(positive_score - negative_penalty, 0)

    def _assess_burnout_risk_advanced(self, today_data: Dict, historical_data: List) -> str:
        """
        Advanced burnout risk assessment using multiple indicators and trends
        """
        if len(historical_data) < 3:
            return "LOW"
        
        recent_days = historical_data[-3:]
        risk_score = 0
        
        # Sleep values and trend analysis
        sleep_values = [day.get("health", {}).get("sleep_duration", 7) for day in recent_days]
        avg_sleep = self._calculate_mean(sleep_values)
        sleep_trend = self._calculate_trend(sleep_values)
        
        if avg_sleep < 6.5:
            risk_score += 2
        if sleep_trend < -0.2:  # Declining sleep
            risk_score += 1
        
        # Stress escalation pattern
        stress_values = [day.get("mood", {}).get("stress", 5) for day in recent_days]
        stress_trend = self._calculate_trend(stress_values)
        avg_stress = self._calculate_mean(stress_values)
        
        if avg_stress > 7:
            risk_score += 2
        if stress_trend > 0.5:  # Increasing stress
            risk_score += 1
        
        # Productivity decline with workload consideration
        prod_values = [day.get("scores", {}).get("productivity", 70) for day in recent_days]
        prod_trend = self._calculate_trend(prod_values)
        
        if prod_trend < -5:  # Significant decline
            risk_score += 1
        
        # Physical activity and screen time balance
        today_steps = today_data["health"]["steps"]
        today_screen = today_data["screen_time"]["total_screen_time"]
        
        if today_steps < 5000 and today_screen > 480:
            risk_score += 1
        
        # Advanced risk classification
        if risk_score >= 5:
            return "HIGH"
        elif risk_score >= 3:
            return "MODERATE"
        else:
            return "LOW"

    def _classify_day_type_advanced(self, today_data: Dict, historical_data: List, scores: Dict) -> str:
        """
        Advanced day type classification using energy levels and recent patterns
        """
        if len(historical_data) < 2:
            return "BALANCED"
        
        recent_2_days = historical_data[-2:]
        
        # Calculate recovery indicators
        avg_sleep = self._calculate_mean([day.get("health", {}).get("sleep_duration", 7) for day in recent_2_days])
        avg_stress = self._calculate_mean([day.get("mood", {}).get("stress", 5) for day in recent_2_days])
        avg_score = self._calculate_mean([day.get("overall_score", 70) for day in recent_2_days])
        
        # Today's energy and readiness indicators
        today_energy = today_data["mood"]["energy"]
        today_sleep_quality = today_data["health"]["sleep_quality"]
        today_motivation = today_data["mood"]["motivation"]
        
        # Recovery day indicators (prioritize rest)
        recovery_signals = 0
        if avg_sleep < 6.5: recovery_signals += 1
        if avg_stress > 7: recovery_signals += 1
        if avg_score < 60: recovery_signals += 1
        if today_energy < 5: recovery_signals += 1
        
        if recovery_signals >= 2:
            return "RECOVERY"
        
        # Push day indicators (high performance potential)
        push_signals = 0
        if avg_sleep > 7.5: push_signals += 1
        if avg_stress < 4: push_signals += 1
        if avg_score > 80: push_signals += 1
        if today_energy > 7 and today_motivation > 7: push_signals += 1
        if today_sleep_quality > 7: push_signals += 1
        
        if push_signals >= 3:
            return "PUSH"
        
        return "BALANCED"

    def _identify_key_drivers_advanced(self, scores: Dict[str, float]) -> List[str]:
        """
        Advanced key driver identification using statistical analysis
        """
        drivers = []
        score_values = list(scores.values())
        score_mean = self._calculate_mean(score_values)
        score_std = self._calculate_std(score_values)
        
        # Identify standout performers (>1 std dev above mean)
        for component, score in scores.items():
            if score > score_mean + score_std and score > 80:
                drivers.append(f"Exceptional {component} performance ({score:.0f}/100)")
        
        # Identify areas needing attention (>1 std dev below mean)
        for component, score in scores.items():
            if score < score_mean - score_std and score < 60:
                drivers.append(f"{component.title()} requires focused attention ({score:.0f}/100)")
        
        # Check for balanced performance
        if score_std < 10:  # Low variance indicates balance
            drivers.append(f"Well-balanced performance across all areas (σ={score_std:.1f})")
        
        # Ensure at least one driver
        if not drivers:
            best_component = max(scores.keys(), key=lambda k: scores[k])
            drivers.append(f"Strongest performance in {best_component} ({scores[best_component]:.0f}/100)")
        
        return drivers[:3]  # Limit to top 3 drivers

    def _generate_intelligent_insights(self, today_data: Dict, scores: Dict, 
                                     day_type: str, historical_data: List) -> List[str]:
        """
        Generate intelligent, context-aware insights using pattern recognition
        """
        insights = []
        
        # Positive reinforcement based on highest performing area
        best_area = max(scores.keys(), key=lambda k: scores[k])
        best_score = scores[best_area]
        
        if best_score > 85:
            insights.append(f"Outstanding {best_area} today! You're demonstrating excellent self-management skills.")
        elif best_score > 75:
            insights.append(f"Strong {best_area} performance today - you're building positive momentum!")
        else:
            insights.append(f"Your {best_area} shows the most promise today - great foundation to build on.")
        
        # Cause-effect analysis using correlation patterns
        if scores["health"] > 75 and scores["productivity"] > 70:
            insights.append("Your excellent sleep and physical activity are clearly fueling your productivity - this is the power of holistic wellness!")
        elif scores["mood"] < 60 and scores["productivity"] < 70:
            insights.append("Lower mood and energy levels appear to be creating challenges for productivity - this connection shows your emotional intelligence.")
        elif scores["focus"] < 60 and today_data["screen_time"]["total_screen_time"] > 360:
            insights.append("High screen time with frequent distractions may be fragmenting your attention - awareness is the first step to improvement.")
        
        # Improvement opportunity with specific, actionable guidance
        lowest_area = min(scores.keys(), key=lambda k: scores[k])
        lowest_score = scores[lowest_area]
        
        if lowest_area == "health" and lowest_score < 70:
            if today_data["health"]["sleep_duration"] < 7:
                insights.append("Prioritizing 7.5+ hours of sleep could significantly boost your overall performance - your body is asking for recovery time.")
            else:
                insights.append("Adding 15-20 minutes of movement to your day could enhance your energy and focus - small steps create big changes.")
        elif lowest_area == "focus" and lowest_score < 70:
            insights.append("Try the 25-minute focused work blocks (Pomodoro technique) to strengthen your concentration muscle - your brain will thank you.")
        elif lowest_area == "mood" and lowest_score < 70:
            insights.append("Incorporating 10 minutes of activities that bring you joy could improve your emotional state and overall performance.")
        elif lowest_area == "productivity" and lowest_score < 70:
            insights.append("Breaking larger tasks into 15-minute micro-goals might help build momentum and confidence.")
        
        # Day type specific insight with encouragement
        if day_type == "RECOVERY":
            insights.append("Your body and mind are signaling for recovery time - honoring this need shows wisdom and self-compassion.")
        elif day_type == "PUSH":
            insights.append("You're in an optimal state for tackling challenging goals - this is your moment to shine!")
        else:
            insights.append("You're in a great position to maintain steady progress while making thoughtful improvements.")
        
        return insights[:4]  # Limit to 4 insights

    def _generate_smart_recommendations(self, today_data: Dict, day_type: str, 
                                      burnout_risk: str, scores: Dict, 
                                      historical_data: List) -> List[str]:
        """
        Generate smart, personalized recommendations using predictive insights
        """
        recommendations = []
        
        # Burnout risk specific recommendations (highest priority)
        if burnout_risk == "HIGH":
            recommendations.extend([
                "🚨 Priority: Aim for 8+ hours of sleep tonight - your performance depends on recovery",
                "📱 Limit screen time to essential activities only for the next 24 hours",
                "🚶‍♀️ Take a 20-minute walk in nature to reset your stress response system"
            ])
        elif burnout_risk == "MODERATE":
            recommendations.extend([
                "😴 Target 7.5+ hours of quality sleep and create a calming bedtime routine",
                "🧘‍♀️ Include 10 minutes of relaxation or mindfulness in tomorrow's schedule"
            ])
        
        # Day type specific recommendations
        if day_type == "RECOVERY":
            recommendations.extend([
                "🎯 Focus on 2-3 essential tasks rather than overloading your schedule",
                "🌱 Include activities that genuinely recharge you (reading, music, gentle movement)",
                "💝 Practice self-compassion - recovery days are productive in their own way"
            ])
        elif day_type == "PUSH":
            recommendations.extend([
                "🚀 This is an ideal day to tackle your most challenging or important project",
                "📚 Consider learning something new or taking on a meaningful stretch goal",
                "⚡ Leverage your high energy for tasks requiring creativity and problem-solving"
            ])
        else:  # BALANCED
            recommendations.extend([
                "⚖️ Maintain your current positive routines while making one small improvement",
                "📈 This is perfect for steady progress on medium-priority tasks"
            ])
        
        # Specific area improvements based on lowest scores
        lowest_area = min(scores.keys(), key=lambda k: scores[k])
        
        if lowest_area == "focus" and today_data["screen_time"]["total_screen_time"] > 300:
            recommendations.append("📱 Set specific 'phone-free' time blocks tomorrow to strengthen your focus muscle")
        
        if lowest_area == "health" and today_data["health"]["steps"] < 7000:
            recommendations.append("👟 Aim for 8,000+ steps tomorrow - even short walks between tasks help significantly")
        
        if lowest_area == "productivity" and scores["productivity"] < 70:
            recommendations.append("✅ Plan your top 3 priorities tonight and tackle the hardest one first when energy is highest")
        
        # Ensure we have actionable recommendations
        if len(recommendations) < 3:
            recommendations.extend([
                "🌅 Start tomorrow with your most important task when mental energy is peak",
                "💧 Stay hydrated and take breaks every 90 minutes for optimal cognitive function"
            ])
        
        return recommendations[:5]  # Limit to 5 recommendations

    def _analyze_weekly_trends_advanced(self, historical_data: List, current_scores: Dict) -> str:
        """
        Advanced weekly trend analysis using statistical methods
        """
        if len(historical_data) < 7:
            return "Continue tracking for 7 days to unlock personalized weekly pattern insights and optimization recommendations."
        
        last_7_days = historical_data[-7:]
        
        # Analyze score patterns
        daily_scores = [day.get("overall_score", 70) for day in last_7_days]
        score_trend = self._calculate_trend(daily_scores)
        
        # Find best performing day and its characteristics
        best_day_idx = daily_scores.index(max(daily_scores))
        best_day = last_7_days[best_day_idx]
        best_score = daily_scores[best_day_idx]
        
        # Analyze what made the best day successful
        success_factors = []
        if best_day.get("health", {}).get("sleep_duration", 7) > 7.5:
            success_factors.append("quality sleep (7.5+ hours)")
        if best_day.get("mood", {}).get("stress", 5) < 4:
            success_factors.append("low stress levels")
        if best_day.get("scores", {}).get("productivity", 70) > 80:
            success_factors.append("high task completion")
        
        # Component variance analysis
        components = ["productivity", "health", "focus", "mood"]
        component_variances = {}
        
        for component in components:
            values = [day.get("scores", {}).get(component, 70) for day in last_7_days]
            component_variances[component] = self._calculate_variance(values)
        
        most_variable = max(component_variances.keys(), key=lambda k: component_variances[k])
        
        # Generate insight
        if score_trend > 2:
            trend_desc = "You're on an upward trajectory this week! 📈"
        elif score_trend < -2:
            trend_desc = "This week shows some challenges, but that's valuable learning data. 📊"
        else:
            trend_desc = "You're maintaining consistent performance this week. ⚖️"
        
        success_pattern = " and ".join(success_factors) if success_factors else "consistent daily routines"
        
        return f"{trend_desc} Your highest score ({best_score}) came from days with {success_pattern}. Your {most_variable} shows the most day-to-day variation (σ={component_variances[most_variable]:.1f}), making it a key leverage point for consistent high performance."

    def _calculate_weighted_score(self, scores: Dict[str, float], user_profile: Dict) -> float:
        """
        Calculate weighted day score with user preferences
        """
        weights = user_profile.get("score_weights", self.default_weights)
        
        weighted_score = sum(
            scores[component] * weights.get(component, self.default_weights[component])
            for component in scores.keys()
        )
        
        return max(0, min(100, weighted_score))

    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """
        Fallback analysis in case of errors
        """
        return {
            "day_score": 70,
            "day_type": "BALANCED",
            "burnout_risk": "LOW",
            "key_score_drivers": ["Moderate performance across all areas"],
            "daily_insights": [
                "Every day is a learning opportunity - you're building valuable self-awareness.",
                "Focus on one small improvement rather than trying to change everything at once.",
                "Remember that progress isn't always linear - consistency matters more than perfection."
            ],
            "actionable_recommendations": [
                "Prioritize 7-8 hours of quality sleep tonight",
                "Plan your top 3 priorities for tomorrow",
                "Take regular breaks to maintain energy throughout the day"
            ],
            "weekly_trend_insight": "Continue tracking your daily patterns to unlock personalized insights."
        }
    def _calculate_trend(self, values):
        """Calculate trend using simple linear regression"""
        if len(values) < 2:
            return 0
        
        n = len(values)
        x_sum = sum(range(n))
        y_sum = sum(values)
        xy_sum = sum(i * values[i] for i in range(n))
        x2_sum = sum(i * i for i in range(n))
        
        if n * x2_sum - x_sum * x_sum == 0:
            return 0
            
        return (n * xy_sum - x_sum * y_sum) / (n * x2_sum - x_sum * x_sum)

    def _calculate_variance(self, values):
        """Calculate variance"""
        if len(values) < 2:
            return 0
        
        mean = sum(values) / len(values)
        squared_diffs = [(val - mean) ** 2 for val in values]
        return sum(squared_diffs) / len(values)

    def _calculate_mean(self, values):
        """Calculate mean"""
        return sum(values) / len(values) if values else 0

    def _calculate_std(self, values):
        """Calculate standard deviation"""
        if len(values) < 2:
            return 0
        variance = self._calculate_variance(values)
        return math.sqrt(variance)
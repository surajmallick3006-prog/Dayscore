/**
 * DayScore AI - Context-aware daily effectiveness and wellness analyzer
 * Analyzes user data holistically to provide personalized insights and recommendations
 */

class DayScoreAI {
  constructor() {
    this.scoreWeights = {
      productivity: 0.30,
      health: 0.25,
      focus: 0.25,
      mood: 0.20
    };
  }

  /**
   * Main analysis function - processes all user data and returns comprehensive insights
   */
  analyzeDayScore(userData) {
    const {
      userProfile,
      todayData,
      historicalData = []
    } = userData;

    // Calculate component scores
    const productivityScore = this.calculateProductivityScore(todayData.productivity, userProfile.dailyGoals);
    const healthScore = this.calculateHealthScore(todayData.health, userProfile.dailyGoals);
    const focusScore = this.calculateFocusScore(todayData.screenTime, todayData.productivity);
    const moodScore = this.calculateMoodScore(todayData.mood);

    // Calculate weighted day score
    const dayScore = Math.round(
      (productivityScore * (userProfile.scoreWeights?.productivity || this.scoreWeights.productivity)) +
      (healthScore * (userProfile.scoreWeights?.health || this.scoreWeights.health)) +
      (focusScore * (userProfile.scoreWeights?.focus || this.scoreWeights.focus)) +
      (moodScore * (userProfile.scoreWeights?.mood || this.scoreWeights.mood))
    );

    // Analyze patterns and context
    const burnoutRisk = this.assessBurnoutRisk(todayData, historicalData);
    const dayType = this.classifyDayType(todayData, historicalData);
    const keyScoreDrivers = this.identifyKeyDrivers({
      productivity: productivityScore,
      health: healthScore,
      focus: focusScore,
      mood: moodScore
    });

    // Generate insights and recommendations
    const dailyInsights = this.generateDailyInsights(todayData, {
      productivity: productivityScore,
      health: healthScore,
      focus: focusScore,
      mood: moodScore
    }, dayType);

    const actionableRecommendations = this.generateRecommendations(
      todayData, 
      dayType, 
      burnoutRisk, 
      keyScoreDrivers
    );

    const weeklyTrendInsight = this.analyzeWeeklyTrends(historicalData);

    return {
      dayScore,
      dayType,
      burnoutRisk,
      keyScoreDrivers,
      dailyInsights,
      actionableRecommendations,
      weeklyTrendInsight
    };
  }

  /**
   * Calculate productivity score based on tasks, time logs, and focus quality
   */
  calculateProductivityScore(productivityData, goals) {
    if (!productivityData) return 50;

    const {
      tasksCompleted = 0,
      totalTasks = 1,
      studyTime = 0,
      workTime = 0,
      avgProductivityRating = 5,
      avgFocusQuality = 5
    } = productivityData;

    // Task completion rate (0-40 points)
    const taskCompletionRate = Math.min(tasksCompleted / Math.max(totalTasks, 1), 1);
    const taskScore = taskCompletionRate * 40;

    // Time goals achievement (0-30 points)
    const totalActiveTime = studyTime + workTime;
    const targetTime = (goals?.studyHours || 4) + (goals?.workHours || 8);
    const timeScore = Math.min(totalActiveTime / (targetTime * 60), 1) * 30;

    // Quality ratings (0-30 points)
    const qualityScore = ((avgProductivityRating + avgFocusQuality) / 20) * 30;

    return Math.min(Math.round(taskScore + timeScore + qualityScore), 100);
  }

  /**
   * Calculate health score based on sleep and physical activity
   */
  calculateHealthScore(healthData, goals) {
    if (!healthData) return 50;

    const {
      sleepDuration = 7,
      sleepQuality = 5,
      steps = 5000,
      activeMinutes = 20,
      exerciseDuration = 0
    } = healthData;

    // Sleep score (0-60 points)
    const targetSleep = goals?.sleepHours || 8;
    const sleepDurationScore = Math.min(sleepDuration / targetSleep, 1) * 30;
    const sleepQualityScore = (sleepQuality / 10) * 30;
    const sleepScore = sleepDurationScore + sleepQualityScore;

    // Activity score (0-40 points)
    const targetSteps = goals?.steps || 10000;
    const stepsScore = Math.min(steps / targetSteps, 1) * 25;
    const activityScore = Math.min((activeMinutes + exerciseDuration) / 60, 1) * 15;

    return Math.min(Math.round(sleepScore + stepsScore + activityScore), 100);
  }

  /**
   * Calculate focus score based on screen time and distraction patterns
   */
  calculateFocusScore(screenTimeData, productivityData) {
    if (!screenTimeData) return 50;

    const {
      totalScreenTime = 300,
      categories = {},
      distractions = { count: 10 }
    } = screenTimeData;

    const productiveTime = categories.productivity || 0;
    const distractingTime = (categories.social || 0) + (categories.entertainment || 0);

    // Productive vs distracting ratio (0-40 points)
    const productiveRatio = productiveTime / Math.max(totalScreenTime, 1);
    const ratioScore = productiveRatio * 40;

    // Distraction management (0-30 points)
    const distractionScore = Math.max(30 - (distractions.count * 2), 0);

    // Focus quality from productivity data (0-30 points)
    const focusQualityScore = ((productivityData?.avgFocusQuality || 5) / 10) * 30;

    return Math.min(Math.round(ratioScore + distractionScore + focusQualityScore), 100);
  }

  /**
   * Calculate mood score based on emotional and mental state indicators
   */
  calculateMoodScore(moodData) {
    if (!moodData) return 50;

    const {
      mood = 3,
      energy = 5,
      stress = 5,
      motivation = 5,
      anxiety = 5
    } = moodData;

    // Positive indicators (mood, energy, motivation)
    const positiveScore = ((mood / 5) * 25) + ((energy / 10) * 25) + ((motivation / 10) * 25);

    // Negative indicators (stress, anxiety) - inverted
    const negativeScore = (((10 - stress) / 10) * 12.5) + (((10 - anxiety) / 10) * 12.5);

    return Math.min(Math.round(positiveScore + negativeScore), 100);
  }

  /**
   * Assess burnout risk based on multi-day patterns
   */
  assessBurnoutRisk(todayData, historicalData) {
    if (historicalData.length < 3) return "LOW";

    const recent3Days = historicalData.slice(-3);
    let riskFactors = 0;

    // Sleep deficit pattern
    const avgSleep = recent3Days.reduce((sum, day) => sum + (day.health?.sleepDuration || 7), 0) / 3;
    if (avgSleep < 6.5) riskFactors++;

    // Increasing stress trend
    const stressTrend = this.calculateTrend(recent3Days.map(day => day.mood?.stress || 5));
    if (stressTrend > 0.5) riskFactors++;

    // Declining productivity
    const productivityTrend = this.calculateTrend(recent3Days.map(day => day.productivity?.avgProductivityRating || 5));
    if (productivityTrend < -0.5) riskFactors++;

    // High screen time
    const avgScreenTime = recent3Days.reduce((sum, day) => sum + (day.screenTime?.totalScreenTime || 300), 0) / 3;
    if (avgScreenTime > 480) riskFactors++; // > 8 hours

    // Low physical activity
    const avgSteps = recent3Days.reduce((sum, day) => sum + (day.health?.steps || 5000), 0) / 3;
    if (avgSteps < 5000) riskFactors++;

    if (riskFactors >= 3) return "HIGH";
    if (riskFactors >= 2) return "MODERATE";
    return "LOW";
  }

  /**
   * Classify day type based on recent patterns and recovery needs
   */
  classifyDayType(todayData, historicalData) {
    if (historicalData.length < 2) return "BALANCED";

    const recent2Days = historicalData.slice(-2);
    const avgDayScore = recent2Days.reduce((sum, day) => sum + (day.overallScore || 70), 0) / 2;
    const avgSleep = recent2Days.reduce((sum, day) => sum + (day.health?.sleepDuration || 7), 0) / 2;
    const avgStress = recent2Days.reduce((sum, day) => sum + (day.mood?.stress || 5), 0) / 2;

    // Recovery day indicators
    if (avgSleep < 6.5 || avgStress > 7 || avgDayScore < 60) {
      return "RECOVERY";
    }

    // Push day indicators
    if (avgSleep > 7.5 && avgStress < 4 && avgDayScore > 80) {
      return "PUSH";
    }

    return "BALANCED";
  }

  /**
   * Identify the key factors driving the day score
   */
  identifyKeyDrivers(scores) {
    const drivers = [];
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Highest performing area
    if (sortedScores[0][1] > 80) {
      drivers.push(`Excellent ${sortedScores[0][0]} performance`);
    }

    // Lowest performing area
    if (sortedScores[3][1] < 60) {
      drivers.push(`${sortedScores[3][0]} needs attention`);
    }

    // Balanced performance
    if (Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 20) {
      drivers.push("Well-balanced across all areas");
    }

    return drivers.length > 0 ? drivers : ["Moderate performance across all areas"];
  }

  /**
   * Generate personalized daily insights
   */
  generateDailyInsights(todayData, scores, dayType) {
    const insights = [];

    // Positive reinforcement
    const highestScore = Math.max(...Object.values(scores));
    const highestArea = Object.keys(scores).find(key => scores[key] === highestScore);
    insights.push(`Great job on your ${highestArea} today! You're building positive momentum.`);

    // Cause-effect explanation
    if (scores.health > 75 && scores.productivity > 70) {
      insights.push("Your good sleep and physical activity are clearly supporting your productivity levels.");
    } else if (scores.mood < 60 && scores.productivity < 70) {
      insights.push("Lower mood and energy levels seem to be impacting your productivity today.");
    } else if (scores.focus < 60) {
      insights.push("Screen time distractions may be affecting your ability to maintain deep focus.");
    }

    // Improvement opportunity
    const lowestScore = Math.min(...Object.values(scores));
    const lowestArea = Object.keys(scores).find(key => scores[key] === lowestScore);
    
    if (lowestArea === 'health') {
      insights.push("Consider prioritizing sleep or adding a short walk to boost your health score tomorrow.");
    } else if (lowestArea === 'focus') {
      insights.push("Try using focus techniques like the Pomodoro method to improve concentration.");
    } else if (lowestArea === 'mood') {
      insights.push("Taking breaks for activities you enjoy could help improve your mood and energy.");
    } else {
      insights.push("Breaking larger tasks into smaller, manageable chunks might help boost productivity.");
    }

    // Day type specific insight
    if (dayType === "RECOVERY") {
      insights.push("This appears to be a recovery day - be gentle with yourself and focus on rest.");
    } else if (dayType === "PUSH") {
      insights.push("You're in a great position to tackle challenging goals today!");
    }

    return insights;
  }

  /**
   * Generate actionable recommendations for tomorrow
   */
  generateRecommendations(todayData, dayType, burnoutRisk, keyDrivers) {
    const recommendations = [];

    // Burnout risk specific recommendations
    if (burnoutRisk === "HIGH") {
      recommendations.push("Priority: Get 8+ hours of sleep tonight and plan lighter tasks tomorrow");
      recommendations.push("Take regular 10-minute breaks between study/work sessions");
      recommendations.push("Limit screen time to essential activities only");
    } else if (burnoutRisk === "MODERATE") {
      recommendations.push("Aim for 7.5+ hours of sleep and include relaxation time in your schedule");
      recommendations.push("Add a 15-minute walk or light exercise to your day");
    }

    // Day type specific recommendations
    if (dayType === "RECOVERY") {
      recommendations.push("Focus on 2-3 essential tasks rather than overloading your schedule");
      recommendations.push("Include activities that recharge you (reading, music, nature)");
    } else if (dayType === "PUSH") {
      recommendations.push("This is a great day to tackle your most challenging or important task");
      recommendations.push("Consider learning something new or taking on a stretch goal");
    } else {
      recommendations.push("Maintain your current routine while making small improvements");
    }

    // Specific area improvements
    if (todayData.screenTime?.totalScreenTime > 360) {
      recommendations.push("Set specific times for social media/entertainment to improve focus");
    }

    if (todayData.health?.steps < 7000) {
      recommendations.push("Try to get 8,000+ steps tomorrow - even short walks help");
    }

    // Ensure we have at least 3 recommendations
    if (recommendations.length < 3) {
      recommendations.push("Plan your top 3 priorities for tomorrow before going to bed");
      recommendations.push("Start your day with the most important task when energy is highest");
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Analyze weekly trends and patterns
   */
  analyzeWeeklyTrends(historicalData) {
    if (historicalData.length < 7) {
      return "Collect more data this week to unlock personalized trend insights.";
    }

    const last7Days = historicalData.slice(-7);
    
    // Find best performing day pattern
    const dayScores = last7Days.map(day => day.overallScore || 70);
    const bestDayIndex = dayScores.indexOf(Math.max(...dayScores));
    const bestDay = last7Days[bestDayIndex];

    // Identify what made the best day successful
    let bestPattern = "your most productive days";
    if (bestDay.health?.sleepDuration > 7.5) {
      bestPattern = "days when you get 7.5+ hours of sleep";
    } else if (bestDay.productivity?.tasksCompleted > 4) {
      bestPattern = "days when you complete 4+ tasks";
    }

    // Find the most impactful component
    const componentVariances = {
      productivity: this.calculateVariance(last7Days.map(d => d.scores?.productivity || 70)),
      health: this.calculateVariance(last7Days.map(d => d.scores?.health || 70)),
      focus: this.calculateVariance(last7Days.map(d => d.scores?.focus || 70)),
      mood: this.calculateVariance(last7Days.map(d => d.scores?.mood || 70))
    };

    const mostVariable = Object.keys(componentVariances).reduce((a, b) => 
      componentVariances[a] > componentVariances[b] ? a : b
    );

    return `This week, ${bestPattern} correlate with your highest scores. Your ${mostVariable} shows the most day-to-day variation, making it a key area to focus on for consistent performance.`;
  }

  /**
   * Helper function to calculate trend (positive = increasing, negative = decreasing)
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = values.reduce((sum, val, i) => sum + (i * i), 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Helper function to calculate variance
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

module.exports = DayScoreAI;
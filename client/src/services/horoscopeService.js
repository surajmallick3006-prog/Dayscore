class HoroscopeService {
  constructor() {
    this.horoscopePredictions = {
      aries: [
        "Your energy is high today. Channel it into one clear goal.",
        "Take the lead, but don't rush decisions.",
        "Momentum builds when you start early."
      ],
      taurus: [
        "Slow and steady brings the best results today.",
        "Comfort and consistency work in your favor.",
        "Stick to what you know — it pays off."
      ],
      gemini: [
        "Your mind is sharp today. Focus on one thing at a time.",
        "Good day for conversations and ideas.",
        "Too many options? Choose the simplest."
      ],
      cancer: [
        "Emotional balance is your strength today.",
        "Protect your peace — not everything needs a response.",
        "Trust your instincts."
      ],
      leo: [
        "A moment to shine is coming — stay confident.",
        "Lead with warmth, not pressure.",
        "Your presence makes an impact today."
      ],
      virgo: [
        "Small details bring big wins today.",
        "Organize first, act later.",
        "Progress feels better than perfection."
      ],
      libra: [
        "Balance is key today — don't overcommit.",
        "Choose calm over conflict.",
        "A fair decision brings relief."
      ],
      scorpio: [
        "Your focus runs deep today — use it wisely.",
        "Not everything needs to be shared.",
        "Trust your inner compass."
      ],
      sagittarius: [
        "Curiosity leads you somewhere interesting today.",
        "Say yes to learning, no to distractions.",
        "Momentum builds when you move."
      ],
      capricorn: [
        "Consistency beats speed today.",
        "A practical approach brings clarity.",
        "You're closer to your goal than you think."
      ],
      aquarius: [
        "Fresh ideas come naturally today.",
        "Do things your way — it works.",
        "Innovation brings energy."
      ],
      pisces: [
        "Creativity flows easily today.",
        "Listen to your emotions — they guide you well.",
        "Rest is productive too."
      ]
    };

    this.tomorrowHints = [
      "Tomorrow feels lighter.",
      "Take things slow tomorrow.",
      "Energy improves as the day goes on.",
      "Focus brings results tomorrow."
    ];

    this.vibes = {
      aries: '⚡ Focus',
      taurus: '😌 Calm',
      gemini: '⚡ Focus',
      cancer: '🧘 Balance',
      leo: '🔥 Action',
      virgo: '⚡ Focus',
      libra: '🧘 Balance',
      scorpio: '⚡ Focus',
      sagittarius: '🔥 Action',
      capricorn: '😌 Calm',
      aquarius: '🔥 Action',
      pisces: '🌙 Rest'
    };

    this.zodiacInfo = {
      aries: { name: 'Aries', symbol: '♈' },
      taurus: { name: 'Taurus', symbol: '♉' },
      gemini: { name: 'Gemini', symbol: '♊' },
      cancer: { name: 'Cancer', symbol: '♋' },
      leo: { name: 'Leo', symbol: '♌' },
      virgo: { name: 'Virgo', symbol: '♍' },
      libra: { name: 'Libra', symbol: '♎' },
      scorpio: { name: 'Scorpio', symbol: '♏' },
      sagittarius: { name: 'Sagittarius', symbol: '♐' },
      capricorn: { name: 'Capricorn', symbol: '♑' },
      aquarius: { name: 'Aquarius', symbol: '♒' },
      pisces: { name: 'Pisces', symbol: '♓' }
    };
  }

  // Get today's horoscope for a specific sign
  getTodayHoroscope(zodiacSign) {
    if (!zodiacSign || !this.horoscopePredictions[zodiacSign]) {
      return null;
    }

    const predictions = this.horoscopePredictions[zodiacSign];
    const today = new Date().toDateString();
    
    // Use date as seed for consistent daily prediction
    const dateHash = this.hashCode(today + zodiacSign);
    const predictionIndex = Math.abs(dateHash) % predictions.length;
    
    const zodiacInfo = this.zodiacInfo[zodiacSign];
    const vibe = this.vibes[zodiacSign];
    
    return {
      sign: zodiacSign,
      name: zodiacInfo.name,
      symbol: zodiacInfo.symbol,
      prediction: predictions[predictionIndex],
      vibe: vibe,
      date: today
    };
  }

  // Get tomorrow's hint
  getTomorrowHint() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toDateString();
    
    const dateHash = this.hashCode(tomorrowString);
    const hintIndex = Math.abs(dateHash) % this.tomorrowHints.length;
    
    return this.tomorrowHints[hintIndex];
  }

  // Simple hash function for consistent daily predictions
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Store user's zodiac sign
  setUserZodiacSign(zodiacSign) {
    localStorage.setItem('userZodiacSign', zodiacSign);
  }

  // Get user's zodiac sign
  getUserZodiacSign() {
    return localStorage.getItem('userZodiacSign');
  }

  // Check if user has set their zodiac sign
  hasZodiacSign() {
    return !!this.getUserZodiacSign();
  }

  // Store horoscope feedback
  storeHoroscopeFeedback(zodiacSign, date, isAccurate) {
    const feedback = {
      zodiacSign,
      date,
      isAccurate,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('horoscopeFeedback') || '[]');
    existingFeedback.push(feedback);
    
    // Keep only last 30 days of feedback
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFeedback = existingFeedback.filter(f => 
      new Date(f.timestamp) > thirtyDaysAgo
    );
    
    localStorage.setItem('horoscopeFeedback', JSON.stringify(recentFeedback));
  }

  // Get horoscope accuracy stats
  getAccuracyStats(zodiacSign) {
    const feedback = JSON.parse(localStorage.getItem('horoscopeFeedback') || '[]');
    const signFeedback = feedback.filter(f => f.zodiacSign === zodiacSign);
    
    if (signFeedback.length === 0) {
      return null;
    }
    
    const accurateCount = signFeedback.filter(f => f.isAccurate).length;
    const accuracy = Math.round((accurateCount / signFeedback.length) * 100);
    
    return {
      totalReadings: signFeedback.length,
      accuracy: accuracy
    };
  }

  // Check if user has already given feedback today
  hasGivenFeedbackToday(zodiacSign) {
    const today = new Date().toDateString();
    const feedback = JSON.parse(localStorage.getItem('horoscopeFeedback') || '[]');
    
    return feedback.some(f => 
      f.zodiacSign === zodiacSign && 
      new Date(f.timestamp).toDateString() === today
    );
  }
}

const horoscopeService = new HoroscopeService();
export default horoscopeService;
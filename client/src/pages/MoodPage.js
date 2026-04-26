import React, { useState, useEffect } from 'react';
import { Smile, TrendingUp, Calendar, Heart, X, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const MoodPage = () => {
  const { saveMoodData } = useData();
  const [selectedMood, setSelectedMood] = useState(3);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(4);
  const [notes, setNotes] = useState('');
  const [showConsolingPopup, setShowConsolingPopup] = useState(false);
  const [consolingMessage, setConsolingMessage] = useState('');
  const [moodEntries, setMoodEntries] = useState([]);

  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  // Load mood entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      setMoodEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Generate emotional consoling message based on user inputs - PURE EMOTIONAL SUPPORT
  const generateConsolingMessage = (mood, energyLevel, stressLevel, userNotes) => {
    const messages = {
      // Very Sad (1) - Deep emotional validation and comfort
      1: {
        low_energy_high_stress: "My heart goes out to you right now. I can feel the weight you're carrying, and I want you to know that your pain is real and it matters. You don't have to be strong for anyone right now - it's okay to feel broken, it's okay to hurt, and it's okay to not know how you'll get through this. Your sadness doesn't make you weak; it makes you human. I'm holding space for your pain, and I believe in the love that lives within you, even when you can't feel it. You are not alone in this darkness. 💙",
        low_energy_low_stress: "I can sense the deep sadness in your heart, and I want you to know that I see you. Your feelings are so valid, and there's nothing wrong with feeling this way. Sometimes our souls just need to grieve, to feel, to process the depth of what it means to be human. Your sadness is not a flaw - it's proof that you love deeply, that you care, that you're alive. Let yourself feel this without judgment. You are worthy of love and compassion, especially from yourself. 🤗",
        high_energy_high_stress: "I can feel the storm inside you - the sadness mixed with all that energy and stress must feel overwhelming. Your heart is working so hard right now, feeling so much, and that takes incredible courage. You're not falling apart; you're feeling deeply, and that's a beautiful thing even when it hurts. Your emotions are valid, your pain is real, and you don't have to carry this alone. I see your strength even in your sadness. 💪",
        high_energy_low_stress: "Even in your sadness, there's something beautiful about your spirit that I can feel. Your heart is tender right now, and that tenderness is not weakness - it's your capacity to love, to feel, to be deeply human. Sometimes sadness visits us not as punishment, but as a reminder of how much we care. Your feelings are honored here, and you are loved exactly as you are in this moment. 🌅"
      },
      // Sad (2) - Gentle emotional embrace
      2: {
        low_energy_high_stress: "I can feel your heart is heavy right now, and I want to wrap you in the warmest, most gentle embrace. You're feeling so much, and it's exhausting to carry all of that emotion. Your sadness is welcome here - you don't have to hide it or fix it or explain it away. Just let it be, let yourself be. You are loved in your sadness, you are valued in your struggle, and you are never, ever alone. 🫂",
        low_energy_low_stress: "There's something so tender about the sadness you're feeling right now. It's like your heart is speaking a language that only you understand, and that's okay. You don't need to translate it for anyone else. Your gentle sadness is valid, it's real, and it's part of your beautiful, complex human experience. I'm here with you in this quiet sadness, holding space for whatever you're feeling. 🌱",
        high_energy_high_stress: "I can feel the intensity of your emotions right now - sadness mixed with so much energy and stress. Your heart is working overtime, feeling everything so deeply. That's not too much; that's just how big your heart is. You feel things intensely because you love intensely, because you care deeply. Your emotional intensity is a gift, even when it feels overwhelming. 📝",
        high_energy_low_stress: "Your sadness has a different quality to it today - there's energy there, there's life there, even in the midst of feeling down. That tells me something beautiful about your spirit. You're sad, and that's completely okay, but there's still light in you. Your sadness doesn't dim your inner light; it just gives it a different color. You are radiant even in your sadness. 🌈"
      },
      // Neutral (3) - Gentle acknowledgment and presence
      3: {
        low_energy_high_stress: "I can sense you're in a space of just... existing right now, and that's perfectly okay. Sometimes our hearts need to be neutral, to just be without feeling too much in any direction. You're not numb, you're not broken - you're just being human in the way you need to be today. I'm here with you in this in-between space, and you are enough exactly as you are. 😌",
        low_energy_low_stress: "There's something peaceful about where you are emotionally right now. Not high, not low, just... present. Just being. That's actually a beautiful place to be - in the quiet center of yourself. Your calm neutrality is a form of self-care, a way of just existing without pressure. I honor this gentle space you're in. 🕯️",
        high_energy_high_stress: "I can feel there's a lot happening inside you right now, even though your emotions feel neutral. Sometimes our hearts protect us by staying steady when everything else feels chaotic. Your emotional stability in the midst of stress shows incredible inner strength. You're holding yourself together beautifully. ⚡",
        high_energy_low_stress: "What a lovely, balanced place you're in emotionally. There's energy in you, there's calm in you, and there's this beautiful neutrality that feels like contentment. You're not forcing happiness, you're not pushing away sadness - you're just being authentically you. That's so beautiful. ✨"
      },
      // Happy (4) - Celebrating and honoring joy
      4: {
        low_energy_high_stress: "Your happiness is shining through even when you're tired and stressed, and that tells me something incredible about your spirit. Your joy is not dependent on perfect circumstances - it comes from somewhere deep and real inside you. That happiness you're feeling? It's yours, it's real, and it's beautiful. Let it warm you from the inside out. 🌟",
        low_energy_low_stress: "There's something so gentle and lovely about your happiness right now. It's not loud or demanding - it's just quietly there, like a warm glow in your heart. This peaceful joy is one of life's most precious gifts. You deserve to feel this happiness, to rest in it, to let it fill all the quiet spaces in your soul. 🌸",
        high_energy_high_stress: "Your happiness is so vibrant and alive, even with stress present! I can feel the joy radiating from you, and it's absolutely beautiful. Your ability to feel genuine happiness while dealing with stress shows the incredible resilience of your heart. Your joy is a light that nothing can dim. 🌞",
        high_energy_low_stress: "Oh, what beautiful energy you have today! Your happiness is infectious, your spirit is bright, and there's something absolutely radiant about you right now. This joy you're feeling - soak it up, let it fill every cell of your being. You deserve every moment of this happiness. 🎉"
      },
      // Very Happy (5) - Pure celebration of joy
      5: {
        low_energy_high_stress: "Your joy is absolutely radiant right now! Even when you're tired and stressed, your happiness is shining so brightly. That kind of joy comes from the deepest part of your soul - it's unshakeable, it's real, and it's yours. Your heart knows something beautiful that your mind might not understand yet. Trust that joy, let it carry you. 🌺",
        low_energy_low_stress: "The happiness you're feeling right now is like pure sunshine in your soul. It's gentle, it's warm, it's completely authentic. This is what contentment feels like - not needing anything to be different, just being filled with gratitude and joy for exactly what is. Your heart is so full right now, and it's beautiful to witness. 🙏",
        high_energy_high_stress: "Your joy is absolutely unstoppable right now! I can feel the incredible energy and happiness radiating from you, and it's magnificent. Even with stress present, your happiness is so powerful, so genuine, so alive. You are a force of nature when you're this happy, and the world is brighter because of your light. 🚀",
        high_energy_low_stress: "You are absolutely glowing with happiness right now! This is pure, unbridled joy, and it's the most beautiful thing. Your heart is so full, your spirit is so bright, and your energy is absolutely infectious. This is what it looks like when someone is truly alive, truly happy, truly themselves. You are magnificent. 🌈✨"
      }
    };

    // Determine energy and stress categories
    const energyCategory = energyLevel <= 5 ? 'low' : 'high';
    const stressCategory = stressLevel <= 5 ? 'low' : 'high';
    const key = `${energyCategory}_energy_${stressCategory}_stress`;

    let baseMessage = messages[mood]?.[key] || messages[3][key]; // Default to neutral if mood not found

    // Add deeply personal touch based on notes - EMOTIONAL VALIDATION ONLY
    if (userNotes && userNotes.trim().length > 0) {
      const personalizedAddition = "\n\nI can feel the depth of your heart in the words you've shared. Thank you for trusting me with your inner world - your thoughts, your feelings, your truth. The fact that you took time to express what's in your heart shows how much you honor your own emotional experience. Your feelings matter, your story matters, and you matter. I see you, I hear you, and I'm holding space for everything you're experiencing. 💝";
      baseMessage += personalizedAddition;
    }

    return baseMessage;
  };

  // Calculate comprehensive mood and wellness scores
  const calculateMoodWellnessScores = (mood, energy, stress, notes) => {
    // Base mood score (0-100)
    const baseMoodScore = (mood - 1) * 25; // Convert 1-5 scale to 0-100
    
    // Energy contribution (0-30 points)
    const energyScore = (energy / 10) * 30;
    
    // Stress penalty (0-25 points deducted)
    const stressPenalty = (stress / 10) * 25;
    
    // Note sentiment analysis (enhanced with emotional intensity and categories)
    let noteSentimentBonus = 0;
    if (notes && notes.trim().length > 0) {
      const noteText = notes.toLowerCase();
      
      // Enhanced keyword categories with emotional intensity weights
      const emotionalKeywords = {
        // High-intensity positive (weight: 4)
        highPositive: ['amazing', 'incredible', 'fantastic', 'wonderful', 'excellent', 'outstanding', 'brilliant', 'perfect', 'thrilled', 'ecstatic', 'overjoyed', 'elated', 'euphoric'],
        
        // Medium-intensity positive (weight: 3)
        mediumPositive: ['happy', 'good', 'great', 'excited', 'grateful', 'blessed', 'love', 'joy', 'peaceful', 'calm', 'relaxed', 'accomplished', 'proud', 'successful', 'hopeful', 'optimistic', 'content', 'satisfied', 'pleased', 'cheerful'],
        
        // Low-intensity positive (weight: 2)
        lowPositive: ['okay', 'fine', 'alright', 'decent', 'nice', 'pleasant', 'comfortable', 'stable', 'steady', 'balanced'],
        
        // High-intensity negative (weight: -4)
        highNegative: ['devastated', 'heartbroken', 'miserable', 'terrible', 'awful', 'horrible', 'depressed', 'hopeless', 'desperate', 'overwhelmed', 'exhausted', 'furious', 'enraged', 'panicked', 'terrified'],
        
        // Medium-intensity negative (weight: -3)
        mediumNegative: ['sad', 'anxious', 'worried', 'stressed', 'angry', 'frustrated', 'lonely', 'difficult', 'hard', 'struggle', 'pain', 'hurt', 'upset', 'disappointed', 'afraid', 'nervous', 'troubled', 'disturbed'],
        
        // Low-intensity negative (weight: -2)
        lowNegative: ['tired', 'bored', 'confused', 'uncertain', 'concerned', 'bothered', 'annoyed', 'restless', 'uneasy'],
        
        // Coping/resilience keywords (weight: 2)
        coping: ['trying', 'working', 'managing', 'dealing', 'coping', 'learning', 'growing', 'improving', 'better', 'healing', 'recovering', 'progressing', 'adapting', 'persevering', 'resilient'],
        
        // Support/connection keywords (weight: 3)
        support: ['family', 'friends', 'support', 'help', 'together', 'connected', 'loved', 'understood', 'listened', 'cared', 'supported', 'encouraged'],
        
        // Achievement/progress keywords (weight: 3)
        achievement: ['achieved', 'completed', 'finished', 'succeeded', 'accomplished', 'reached', 'goal', 'milestone', 'progress', 'breakthrough', 'victory', 'win']
      };
      
      // Count keywords by category and calculate weighted sentiment
      let totalSentiment = 0;
      
      Object.entries(emotionalKeywords).forEach(([category, words]) => {
        const matches = words.filter(word => noteText.includes(word)).length;
        if (matches > 0) {
          
          switch(category) {
            case 'highPositive':
              totalSentiment += matches * 4;
              break;
            case 'mediumPositive':
            case 'support':
            case 'achievement':
              totalSentiment += matches * 3;
              break;
            case 'lowPositive':
            case 'coping':
              totalSentiment += matches * 2;
              break;
            case 'lowNegative':
              totalSentiment += matches * -2;
              break;
            case 'mediumNegative':
              totalSentiment += matches * -3;
              break;
            case 'highNegative':
              totalSentiment += matches * -4;
              break;
            default:
              break;
          }
        }
      });
      
      // Additional analysis for emotional intensity indicators
      const intensityIndicators = {
        // Amplifiers (multiply sentiment by 1.5)
        amplifiers: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so', 'quite', 'pretty'],
        
        // Diminishers (multiply sentiment by 0.7)
        diminishers: ['somewhat', 'slightly', 'a bit', 'kind of', 'sort of', 'maybe', 'perhaps', 'possibly']
      };
      
      let intensityMultiplier = 1.0;
      const amplifierCount = intensityIndicators.amplifiers.filter(word => noteText.includes(word)).length;
      const diminisherCount = intensityIndicators.diminishers.filter(word => noteText.includes(word)).length;
      
      if (amplifierCount > diminisherCount) {
        intensityMultiplier = 1.3;
      } else if (diminisherCount > amplifierCount) {
        intensityMultiplier = 0.8;
      }
      
      // Apply intensity multiplier
      totalSentiment *= intensityMultiplier;
      
      // Length bonus for detailed notes (shows engagement)
      const lengthBonus = Math.min(3, Math.floor(noteText.length / 50));
      
      // Calculate final sentiment bonus (-15 to +20 points)
      noteSentimentBonus = totalSentiment + lengthBonus;
      noteSentimentBonus = Math.max(-15, Math.min(20, noteSentimentBonus));
    }
    
    // Calculate final mood score (0-100)
    const moodScore = Math.max(0, Math.min(100, 
      baseMoodScore + energyScore - stressPenalty + noteSentimentBonus
    ));
    
    // Calculate wellness score with enhanced weighting and note consideration
    const wellnessScore = Math.max(0, Math.min(100,
      (mood * 12) + // Mood weight: 12 points per level (max 60)
      (energy * 4) + // Energy weight: 4 points per level (max 40)  
      ((10 - stress) * 3) + // Stress weight: 3 points per level (max 30, inverted)
      (noteSentimentBonus * 1.5) + // Note sentiment: enhanced weight
      10 // Base wellness score
    ));
    
    // Determine mood category
    let moodCategory = '';
    let wellnessCategory = '';
    
    if (moodScore >= 80) moodCategory = 'Excellent';
    else if (moodScore >= 65) moodCategory = 'Good';
    else if (moodScore >= 50) moodCategory = 'Fair';
    else if (moodScore >= 35) moodCategory = 'Poor';
    else moodCategory = 'Critical';
    
    if (wellnessScore >= 80) wellnessCategory = 'Thriving';
    else if (wellnessScore >= 65) wellnessCategory = 'Stable';
    else if (wellnessScore >= 50) wellnessCategory = 'Moderate';
    else if (wellnessScore >= 35) wellnessCategory = 'Concerning';
    else wellnessCategory = 'Needs Support';
    
    return {
      moodScore: Math.round(moodScore),
      wellnessScore: Math.round(wellnessScore),
      moodCategory,
      wellnessCategory,
      breakdown: {
        baseMood: Math.round(baseMoodScore),
        energyContribution: Math.round(energyScore),
        stressImpact: Math.round(-stressPenalty),
        noteSentiment: Math.round(noteSentimentBonus)
      }
    };
  };

  // Get current scores based on form inputs
  const currentScores = calculateMoodWellnessScores(selectedMood, energy, stress, notes);

  // Save mood entry to calendar with scores
  const saveMoodEntry = () => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const scores = calculateMoodWellnessScores(selectedMood, energy, stress, notes);
    
    const newEntry = {
      id: Date.now(),
      date: dateString,
      dateDisplay: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      mood: selectedMood,
      moodEmoji: moodEmojis[selectedMood - 1],
      moodLabel: moodLabels[selectedMood - 1],
      energy: energy,
      stress: stress,
      notes: notes.trim(),
      timestamp: today.toISOString(),
      // Add calculated scores
      moodScore: scores.moodScore,
      wellnessScore: scores.wellnessScore,
      moodCategory: scores.moodCategory,
      wellnessCategory: scores.wellnessCategory,
      scoreBreakdown: scores.breakdown
    };

    // Update mood entries
    const updatedEntries = [newEntry, ...moodEntries.filter(entry => entry.date !== dateString)];
    setMoodEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    
    // Sync to DataContext / API
    saveMoodData({
      mood: selectedMood,
      energy,
      stress,
      notes: notes.trim(),
      moodScore: scores.moodScore,
      wellnessScore: scores.wellnessScore,
      date: new Date().toISOString(),
    });
    
    // Also save latest scores for dashboard access with wellness components
    localStorage.setItem('latestMoodWellnessScores', JSON.stringify({
      moodScore: scores.moodScore,
      wellnessScore: scores.wellnessScore,
      moodCategory: scores.moodCategory,
      wellnessCategory: scores.wellnessCategory,
      date: dateString,
      timestamp: today.toISOString(),
      // Add wellness components breakdown
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

    // Generate and show consoling message
    const message = generateConsolingMessage(selectedMood, energy, stress, notes);
    setConsolingMessage(message);
    setShowConsolingPopup(true);

    // Reset form
    setNotes('');
  };

  // Get recent entries for display (last 4 entries)
  const getRecentEntries = () => {
    return moodEntries.slice(0, 4).map(entry => ({
      date: entry.dateDisplay === new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) ? 'Today' : entry.dateDisplay,
      mood: entry.moodEmoji,
      energy: entry.energy,
      stress: entry.stress,
      notes: entry.notes
    }));
  };

  // Calendar helper functions
  const getCurrentMonthData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return {
      monthName,
      firstDay: firstDay.getDay(),
      daysInMonth: lastDay.getDate(),
      startDate,
      currentMonth: month,
      currentYear: year
    };
  };

  const getCalendarDays = () => {
    const { startDate, currentMonth } = getCurrentMonthData();
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const moodEntry = moodEntries.find(entry => entry.date === dateString);
      
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date: date.getDate(),
        fullDate: date,
        dateString,
        isCurrentMonth,
        isToday,
        moodEntry
      });
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 -m-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mood & Mental Wellness</h1>
        <p className="text-gray-600 text-lg">Track your emotional well-being and mental health</p>
      </div>

      {/* Emotional Consoling Popup */}
      {showConsolingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-pink-100 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">A Message for You</h3>
              </div>
              <button
                onClick={() => setShowConsolingPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                  {consolingMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Your mood entry has been saved to your calendar</span>
            </div>

            <button
              onClick={() => setShowConsolingPopup(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
            >
              Thank You 💝
            </button>
          </div>
        </div>
      )}

      {/* Today's Mood Entry */}
      <div className="bg-white rounded-3xl shadow-lg border border-white/50 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">How are you feeling today?</h2>
        
        {/* Mood Selector */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-6">Mood</label>
          <div className="flex justify-center space-x-6 mb-4">
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
          </div>
          <div className="text-center">
            <span className="text-lg font-medium text-gray-700">
              {moodLabels[selectedMood - 1]}
            </span>
          </div>
        </div>

        {/* Energy Level */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Energy Level: {energy}/10
          </label>
          <div className="relative">
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
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Stress Level */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Stress Level: {stress}/10
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(stress-1)*11.11}%, #e5e7eb ${(stress-1)*11.11}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
            rows="4"
            placeholder="Share what's on your mind today... Your thoughts and feelings are important."
          />
        </div>

        <button 
          onClick={saveMoodEntry}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg text-lg"
        >
          Save Today's Mood
        </button>

        {/* Real-time Score Display */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-900 mb-6 text-center">Your Current Scores</h3>
          
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
          
          {/* Score Breakdown */}
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Base Mood:</span>
              <span className="font-medium">+{currentScores.breakdown.baseMood}</span>
            </div>
            <div className="flex justify-between">
              <span>Energy Boost:</span>
              <span className="font-medium text-green-600">+{currentScores.breakdown.energyContribution}</span>
            </div>
            <div className="flex justify-between">
              <span>Stress Impact:</span>
              <span className="font-medium text-red-600">{currentScores.breakdown.stressImpact}</span>
            </div>
            {notes.trim().length > 0 && (
              <div className="flex justify-between">
                <span>Note Analysis:</span>
                <span className={`font-medium ${currentScores.breakdown.noteSentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentScores.breakdown.noteSentiment >= 0 ? '+' : ''}{currentScores.breakdown.noteSentiment}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            {notes.trim().length > 0 
              ? "Enhanced analysis considers emotional intensity and context"
              : "Scores update automatically as you adjust your inputs"
            }
          </div>
        </div>
      </div>

      {/* Mood Trends and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Calendar */}
        <div className="bg-white rounded-3xl shadow-lg border border-white/50 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>{getCurrentMonthData().monthName}</span>
          </h3>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-3">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {getCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`
                  relative h-12 flex items-center justify-center text-sm rounded-xl transition-all cursor-pointer
                  ${day.isCurrentMonth 
                    ? day.isToday 
                      ? 'bg-purple-100 text-purple-800 font-bold ring-2 ring-purple-400' 
                      : 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-300'
                  }
                  ${day.moodEntry ? 'bg-gradient-to-br from-pink-50 to-purple-50' : ''}
                `}
                title={day.moodEntry ? `${day.moodEntry.moodLabel} - Energy: ${day.moodEntry.energy}/10, Stress: ${day.moodEntry.stress}/10` : ''}
              >
                <span className="z-10">{day.date}</span>
                {day.moodEntry && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl opacity-80">{day.moodEntry.moodEmoji}</span>
                  </div>
                )}
                {day.isToday && !day.moodEntry && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Calendar Legend */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-100 rounded border border-purple-400"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded border"></div>
                  <span>Mood logged</span>
                </div>
              </div>
              <div className="text-gray-500 font-medium">
                {moodEntries.filter(entry => {
                  const entryDate = new Date(entry.date);
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
                }).length} entries this month
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Score */}
        <div className="bg-white rounded-3xl shadow-lg border border-white/50 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Wellness Score</h3>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-600">
              {moodEntries.length > 0 
                ? Math.round(moodEntries.slice(0, 7).reduce((acc, entry) => acc + (entry.wellnessScore || 75), 0) / Math.min(moodEntries.length, 7))
                : 78
              }
            </div>
            <div className="text-lg text-gray-600 mt-2">Overall Wellness</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mood Stability</span>
              <span className="text-sm font-medium">
                {moodEntries.length > 0 
                  ? Math.round(85 - (moodEntries.slice(0, 7).reduce((acc, entry) => acc + Math.abs(entry.mood - 3), 0) / Math.min(moodEntries.length, 7)) * 10)
                  : 85
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Energy Levels</span>
              <span className="text-sm font-medium">
                {moodEntries.length > 0 
                  ? Math.round((moodEntries.slice(0, 7).reduce((acc, entry) => acc + entry.energy, 0) / Math.min(moodEntries.length, 7)) * 10)
                  : 72
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stress Management</span>
              <span className="text-sm font-medium">
                {moodEntries.length > 0 
                  ? Math.round(100 - (moodEntries.slice(0, 7).reduce((acc, entry) => acc + entry.stress, 0) / Math.min(moodEntries.length, 7)) * 10)
                  : 68
                }%
              </span>
            </div>
          </div>
          
          {/* Monthly Mood Trend */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Monthly Mood Trend</h4>
            <div className="h-20 flex items-end justify-between space-x-2">
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
                    <span className="text-sm text-gray-600">
                      W{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-3xl shadow-lg border border-white/50 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Entries</h3>
        {getRecentEntries().length > 0 ? (
          <div className="space-y-6">
            {getRecentEntries().map((entry, index) => {
              // Get the full entry data to access scores
              const fullEntry = moodEntries.find(e => e.mood === (moodEmojis.indexOf(entry.mood) + 1) && e.energy === entry.energy && e.stress === entry.stress);
              
              return (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                  {/* Header Row - Date and Mood */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-lg font-medium text-gray-800">{entry.date}</span>
                      <span className="text-3xl">{entry.mood}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Energy:</span>
                        <span className="font-semibold text-blue-600 text-lg">{entry.energy}/10</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Stress:</span>
                        <span className="font-semibold text-red-600 text-lg">{entry.stress}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scores Row */}
                  {fullEntry && fullEntry.moodScore && (
                    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Mood Score:</span>
                          <span className="font-bold text-purple-600 text-lg">{fullEntry.moodScore}/100</span>
                          <span className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded-full">({fullEntry.moodCategory})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Wellness:</span>
                          <span className="font-bold text-pink-600 text-lg">{fullEntry.wellnessScore}/100</span>
                          <span className="text-xs text-pink-500 bg-pink-100 px-2 py-1 rounded-full">({fullEntry.wellnessCategory})</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes Row */}
                  {entry.notes && (
                    <div className="mt-4 pt-4 border-t border-purple-100">
                      <div className="flex items-start space-x-3">
                        <span className="text-sm text-purple-600 font-medium mt-1">Note:</span>
                        <p className="text-sm text-gray-700 italic leading-relaxed flex-1 bg-white p-3 rounded-xl">
                          "{entry.notes}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Smile className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No mood entries yet. Start tracking your emotional well-being today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodPage;
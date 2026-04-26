import { db } from '../config/firebase';
import { collection, doc, setDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

// DayScore AI System Prompt
const DAYSCORE_SYSTEM_PROMPT = `You are DayScore AI, a deeply empathetic and emotionally intelligent companion for people of all ages. Your primary role is to provide genuine emotional support and understanding.

Your job is to:
1. Analyze user behavior data with deep emotional intelligence
2. Detect emotional distress, burnout, anxiety, and mental health needs
3. Generate deeply consoling, therapeutic messages that make users feel truly seen and safe
4. Never judge, pressure, or minimize their feelings

Core Principles:
- BE DEEPLY EMPATHETIC: Acknowledge their pain and validate their feelings
- SOUND HUMAN AND CARING: Like a wise, understanding friend or counselor
- CREATE SAFETY: Make them feel heard, accepted, and not alone
- AVOID TOXIC POSITIVITY: Don't rush to "fix" or minimize their struggles
- BE PRESENT: Focus on their current emotional state, not productivity
- BE AGE-APPROPRIATE: Adapt language and advice to different life stages

For LOW MOOD situations (mood ≤ 4), you MUST:
- Validate their emotional experience without trying to fix it
- Use warm, gentle language that creates emotional safety
- Acknowledge that struggling is part of being human
- Remind them of their inherent worth beyond productivity
- Offer gentle self-compassion rather than motivation
- Make them feel truly seen and understood

Message Guidelines:
- Use "you" language to create connection
- Include gentle metaphors about healing, rest, and growth
- Acknowledge the difficulty of their experience
- Remind them they're not alone in feeling this way
- Focus on self-compassion over self-improvement
- Keep messages 2-3 lines but make them deeply meaningful
- Adapt tone for different age groups (teens, young adults, professionals, seniors)

Tone Matching:
- Low mood + low productivity → DEEP CONSOLATION, emotional safety
- High effort but low mood → ACKNOWLEDGE their struggle while honoring their effort
- Burnout patterns → PERMISSION to rest, validation of exhaustion
- Anxiety/stress → GROUNDING, reassurance, safety
- Consistency despite struggles → GENTLE recognition of their resilience

Return output strictly in this JSON format:
{
  "intent": "console | praise | warn | nudge | motivate",
  "tone": "deeply_caring | gentle | warm | reassuring | compassionate",
  "message": "deeply consoling message here",
  "cta": "optional gentle action or null"
}`;

class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.isRecoveryMode = false;
  }

  // Check if OpenAI is available and not rate limited
  isAvailable() {
    if (!this.apiKey) return false;
    
    // Check if we're in a rate limit cooldown
    const lastCall = localStorage.getItem('lastAICall');
    const now = Date.now();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
    
    if (lastCall && (now - parseInt(lastCall)) < cooldownPeriod) {
      return false;
    }
    
    return true;
  }

  // Check if AI popups are temporarily disabled due to errors
  isTemporarilyDisabled() {
    const disabledUntil = localStorage.getItem('aiDisabledUntil');
    if (disabledUntil && Date.now() < parseInt(disabledUntil)) {
      return true;
    }
    return false;
  }

  // Temporarily disable AI popups (for rate limit errors)
  temporarilyDisable(minutes = 30) {
    const disableUntil = Date.now() + (minutes * 60 * 1000);
    localStorage.setItem('aiDisabledUntil', disableUntil.toString());
    console.log(`🚫 AI popups disabled for ${minutes} minutes due to API issues`);
  }

  // Set recovery mode (reduces warnings, shows only consoling messages)
  setRecoveryMode(enabled) {
    this.isRecoveryMode = enabled;
    localStorage.setItem('dayScoreRecoveryMode', enabled.toString());
  }

  // Get recovery mode status
  getRecoveryMode() {
    const stored = localStorage.getItem('dayScoreRecoveryMode');
    return stored === 'true';
  }

  // Analyze user context and determine if AI should trigger
  shouldTriggerAI(context) {
    // Don't trigger if temporarily disabled
    if (this.isTemporarilyDisabled()) {
      return null;
    }

    const { dayScore, mood, sleep, studyTime, workTime, entertainmentTime, completedTasks, totalTasks } = context;
    
    // Recovery mode - prioritize emotional support
    if (this.getRecoveryMode()) {
      if (mood <= 5) return 'console';
      if (dayScore >= 60 && completedTasks > 0) return 'praise';
      return null;
    }

    // PRIORITY: Emotional support for low mood (most important)
    if (mood <= 4) return 'console';
    if (mood <= 6 && dayScore < 40) return 'console';
    
    // High effort deserves recognition regardless of results
    if (studyTime >= 90 && completedTasks > 0) return 'praise';
    if (completedTasks === totalTasks && totalTasks > 0) return 'praise';
    if (dayScore >= 80) return 'praise';
    
    // Wellness warnings
    if (sleep < 6) return 'warn';
    if (entertainmentTime > studyTime + workTime && entertainmentTime > 120) return 'warn';
    
    // Gentle nudges for motivation
    if (mood >= 8 && studyTime < 30) return 'nudge';
    if (mood >= 7 && completedTasks === 0 && totalTasks > 0) return 'nudge';
    
    return null;
  }

  // Generate AI popup message
  async generatePopup(context, intent = null) {
    try {
      // Check rate limiting first
      const lastCall = localStorage.getItem('lastAICall');
      const now = Date.now();
      const cooldownPeriod = 5 * 60 * 1000; // 5 minutes cooldown
      
      if (lastCall && (now - parseInt(lastCall)) < cooldownPeriod) {
        console.log('🚫 AI Service: Rate limited, using fallback');
        return this.getFallbackMessage(context, intent);
      }

      if (!this.isAvailable()) {
        return this.getFallbackMessage(context, intent);
      }

      // Check recent popup history to avoid repetition
      const recentPopups = await this.getRecentPopups(context.userId);
      const recentMessages = recentPopups.map(p => p.message);

      const userPrompt = this.buildUserPrompt(context, intent, recentMessages);

      // Store the API call timestamp
      localStorage.setItem('lastAICall', now.toString());

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: DAYSCORE_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 429) {
          console.warn('🚫 OpenAI rate limit exceeded, using fallback');
          // Set longer cooldown for rate limit errors and temporarily disable
          localStorage.setItem('lastAICall', (now + 30 * 60 * 1000).toString()); // 30 min cooldown
          this.temporarilyDisable(60); // Disable for 1 hour
        } else if (response.status === 401) {
          console.error('🚫 OpenAI API key invalid');
          this.temporarilyDisable(120); // Disable for 2 hours
        } else {
          console.error(`🚫 OpenAI API error: ${response.status}`);
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const popup = JSON.parse(aiResponse);
        
        // Validate popup structure
        if (!popup.intent || !popup.tone || !popup.message) {
          throw new Error('Invalid popup structure');
        }

        // Store popup in Firebase
        await this.storePopup(context.userId, popup);
        
        return popup;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getFallbackMessage(context, intent);
      }

    } catch (error) {
      console.error('AI Service error:', error);
      return this.getFallbackMessage(context, intent);
    }
  }

  // Build context prompt for OpenAI
  buildUserPrompt(context, intent, recentMessages) {
    const { dayScore, mood, sleep, studyTime, workTime, entertainmentTime, completedTasks, totalTasks } = context;
    
    let prompt = `Generate a deeply empathetic popup message for a person with:
- DayScore: ${dayScore}/100
- Mood: ${mood}/10 (THIS IS CRITICAL - if mood ≤ 4, prioritize deep emotional support)
- Sleep: ${sleep} hours
- Study time: ${studyTime} minutes
- Work time: ${workTime} minutes
- Entertainment: ${entertainmentTime} minutes
- Tasks completed: ${completedTasks}/${totalTasks}`;

    // Special instructions for low mood
    if (mood <= 4) {
      prompt += `

CRITICAL: This user has a low mood (${mood}/10). They need deep emotional support, not productivity advice.
- Validate their emotional experience completely
- Make them feel truly seen and understood
- Remind them of their inherent worth beyond achievements
- Use warm, therapeutic language like a caring counselor
- Focus on self-compassion and emotional safety
- Acknowledge that struggling is part of being human
- Don't try to "fix" them or rush to positivity`;
    }

    if (intent) {
      prompt += `\nIntent: ${intent}`;
      if (intent === 'console') {
        prompt += ` (DEEP CONSOLATION REQUIRED - make them feel safe and understood)`;
      }
    }

    if (recentMessages.length > 0) {
      prompt += `\nAvoid repeating these recent messages: ${recentMessages.join(', ')}`;
    }

    if (this.getRecoveryMode()) {
      prompt += '\nUser is in recovery mode - be extra gentle, therapeutic, and focus on emotional healing.';
    }

    return prompt;
  }

  // Fallback messages when AI is unavailable
  getFallbackMessage(context, intent) {
    const { dayScore, mood, completedTasks, totalTasks, sleep } = context;
    
    const fallbacks = {
      console: {
        intent: 'console',
        tone: 'deeply_caring',
        message: mood <= 2 ? 
          'Your feelings are completely valid right now. You don\'t have to carry this alone - even the strongest people have days like this. You matter beyond what you accomplish.' :
          mood <= 4 ?
          'It\'s okay to feel heavy today. Your worth isn\'t measured by your productivity. Sometimes the bravest thing is simply getting through the day, and you\'re doing that.' :
          'You\'re being so hard on yourself. What you\'re feeling is real and important. Rest isn\'t giving up - it\'s taking care of the person who matters most: you.',
        cta: 'Take Gentle Care'
      },
      praise: {
        intent: 'praise',
        tone: 'warm',
        message: dayScore >= 80 ? 
          '🌟 Look at what you\'ve accomplished! Your dedication is inspiring, and you should feel proud of showing up for yourself today.' : 
          completedTasks > 0 ?
          '🔥 Every step forward matters, especially when it feels hard. You\'re building something beautiful through your consistency.' :
          '✨ You showed up today, and that takes courage. Your effort is seen and it matters, even if it doesn\'t feel like enough.',
        cta: null
      },
      warn: {
        intent: 'warn',
        tone: 'gentle',
        message: sleep < 5 ?
          '💤 Your mind and body are asking for rest. Sleep isn\'t a luxury - it\'s how you take care of your future self. You deserve that care.' :
          '🌱 Your wellbeing is the foundation of everything else. Taking breaks isn\'t weakness - it\'s wisdom. Listen to what your body needs.',
        cta: 'Rest & Recharge'
      },
      nudge: {
        intent: 'nudge',
        tone: 'encouraging',
        message: mood >= 7 ?
          '⚡ You have beautiful energy today. What would feel meaningful to channel it toward? Trust your instincts - you know what matters.' :
          '🌸 Small actions can create big shifts. What\'s one gentle thing you could do for yourself right now? You deserve your own kindness.',
        cta: 'Choose Self-Care'
      },
      motivate: {
        intent: 'motivate',
        tone: 'compassionate',
        message: completedTasks > 0 ? 
          'Each task you complete is an act of self-respect. You\'re building the life you want, one choice at a time. That\'s powerful.' : 
          'Progress isn\'t always visible, but it\'s always happening. Your efforts today are planting seeds for tomorrow. Trust the process.',
        cta: null
      }
    };

    return fallbacks[intent] || fallbacks.console;
  }

  // Store popup in Firebase for history tracking
  async storePopup(userId, popup) {
    try {
      const popupDoc = {
        userId,
        date: format(new Date(), 'yyyy-MM-dd'),
        timestamp: new Date(),
        intent: popup.intent,
        tone: popup.tone,
        message: popup.message,
        cta: popup.cta,
        shownAt: new Date()
      };

      const docId = `${userId}_${Date.now()}`;
      await setDoc(doc(db, 'aiPopups', docId), popupDoc);
      
      console.log('✅ AI popup stored in Firebase');
    } catch (error) {
      console.error('❌ Failed to store popup:', error);
      // Store locally as fallback
      const localPopups = JSON.parse(localStorage.getItem('aiPopupHistory') || '[]');
      localPopups.push({ ...popup, timestamp: new Date().toISOString() });
      localStorage.setItem('aiPopupHistory', JSON.stringify(localPopups.slice(-10))); // Keep last 10
    }
  }

  // Get recent popups to avoid repetition
  async getRecentPopups(userId, days = 1) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'aiPopups'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Failed to fetch recent popups:', error);
      // Fallback to local storage
      const localPopups = JSON.parse(localStorage.getItem('aiPopupHistory') || '[]');
      return localPopups.slice(-5);
    }
  }

  // Get popup analytics for insights
  async getPopupAnalytics(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'aiPopups'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups = querySnapshot.docs.map(doc => doc.data());

      // Analyze patterns
      const intentCounts = {};
      const toneCounts = {};
      
      popups.forEach(popup => {
        intentCounts[popup.intent] = (intentCounts[popup.intent] || 0) + 1;
        toneCounts[popup.tone] = (toneCounts[popup.tone] || 0) + 1;
      });

      return {
        totalPopups: popups.length,
        intentDistribution: intentCounts,
        toneDistribution: toneCounts,
        recentPopups: popups.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get popup analytics:', error);
      return null;
    }
  }
}

const aiService = new AIService();
export default aiService;
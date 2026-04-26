import aiService from './aiService';

class ChatService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
  }

  // Analyze sentiment of user message
  analyzeSentiment(message) {
    const lowerMessage = message.toLowerCase();
    
    // Positive sentiment indicators
    const positiveWords = [
      'happy', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent', 
      'good', 'better', 'best', 'love', 'excited', 'thrilled', 'grateful', 'thankful',
      'accomplished', 'proud', 'successful', 'motivated', 'energized', 'confident',
      'optimistic', 'hopeful', 'cheerful', 'delighted', 'pleased', 'satisfied'
    ];
    
    // Negative sentiment indicators
    const negativeWords = [
      'sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'frustrated',
      'angry', 'upset', 'disappointed', 'tired', 'exhausted', 'burned out', 'hopeless',
      'lonely', 'isolated', 'confused', 'lost', 'stuck', 'struggling', 'difficult',
      'hard', 'terrible', 'awful', 'horrible', 'hate', 'can\'t', 'unable', 'failing'
    ];
    
    // Neutral/seeking help indicators
    const helpWords = [
      'help', 'advice', 'guidance', 'support', 'how', 'what', 'when', 'where', 'why',
      'should', 'could', 'would', 'need', 'want', 'looking for', 'trying to'
    ];
    
    // Count sentiment indicators
    let positiveScore = 0;
    let negativeScore = 0;
    let helpScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeScore++;
    });
    
    helpWords.forEach(word => {
      if (lowerMessage.includes(word)) helpScore++;
    });
    
    // Determine dominant sentiment
    if (negativeScore > positiveScore && negativeScore > 0) {
      return {
        sentiment: 'negative',
        intensity: negativeScore > 2 ? 'high' : 'moderate',
        score: -negativeScore
      };
    } else if (positiveScore > negativeScore && positiveScore > 0) {
      return {
        sentiment: 'positive',
        intensity: positiveScore > 2 ? 'high' : 'moderate',
        score: positiveScore
      };
    } else if (helpScore > 0) {
      return {
        sentiment: 'seeking_help',
        intensity: 'moderate',
        score: 0
      };
    } else {
      return {
        sentiment: 'neutral',
        intensity: 'low',
        score: 0
      };
    }
  }

  // Enhanced chat response generation based on sentiment
  async generateChatResponse(userMessage, context) {
    try {
      // Add user message to history
      this.addToHistory('user', userMessage);

      // Analyze sentiment first
      const sentiment = this.analyzeSentiment(userMessage);
      
      // Generate response based on sentiment and context
      let response;
      if (aiService.isAvailable()) {
        response = await this.generateSentimentAwareAIResponse(userMessage, context, sentiment);
      } else {
        response = this.generateSentimentBasedFallback(userMessage, context, sentiment);
      }
      
      this.addToHistory('assistant', response.content);
      return response;
    } catch (error) {
      console.error('Chat service error:', error);
      return this.getErrorResponse();
    }
  }

  // Generate AI response with sentiment awareness
  async generateSentimentAwareAIResponse(userMessage, context, sentiment) {
    const systemPrompt = this.buildSentimentAwareSystemPrompt(sentiment);
    const userPrompt = this.buildSentimentAwareUserPrompt(userMessage, context, sentiment);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.getRecentHistory(),
            { role: 'user', content: userPrompt }
          ],
          temperature: sentiment.sentiment === 'negative' ? 0.3 : 0.7, // Lower temperature for emotional support
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return {
        content: aiResponse,
        sentiment: sentiment,
        type: 'ai'
      };

    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.generateSentimentBasedFallback(userMessage, context, sentiment);
    }
  }

  // Build sentiment-aware system prompt
  buildSentimentAwareSystemPrompt(sentiment) {
    let basePrompt = `You are DayScore AI, a supportive and empathetic productivity companion. You help users with productivity, wellness, and emotional support.`;
    
    switch (sentiment.sentiment) {
      case 'negative':
        basePrompt += `

CRITICAL: The user is expressing negative emotions or distress. Your response should be:
- Deeply empathetic and validating
- Focus on emotional support over productivity advice
- Use warm, caring language
- Acknowledge their feelings without trying to "fix" them immediately
- Offer gentle comfort and understanding
- Avoid toxic positivity or rushing to solutions
- Make them feel heard and not alone

Your tone should be: compassionate, gentle, validating, supportive.`;
        break;
        
      case 'positive':
        basePrompt += `

The user is expressing positive emotions or sharing good news. Your response should be:
- Celebrate their success or positive mood
- Be enthusiastic and encouraging
- Build on their positive energy
- Offer ways to maintain or build on this momentum
- Share in their joy authentically

Your tone should be: enthusiastic, celebratory, encouraging, warm.`;
        break;
        
      case 'seeking_help':
        basePrompt += `

The user is seeking help or guidance. Your response should be:
- Be helpful and informative
- Provide practical, actionable advice
- Ask clarifying questions if needed
- Offer step-by-step guidance
- Be patient and thorough

Your tone should be: helpful, informative, patient, encouraging.`;
        break;
        
      default:
        basePrompt += `

The user's message is neutral. Your response should be:
- Be friendly and conversational
- Gently explore what they might need
- Offer various types of support
- Keep the conversation flowing naturally

Your tone should be: friendly, conversational, open, supportive.`;
    }
    
    basePrompt += `

Always respond naturally without suggesting quick-reply buttons or options. Focus on genuine conversation and emotional connection.`;
    
    return basePrompt;
  }

  // Build sentiment-aware user prompt
  buildSentimentAwareUserPrompt(userMessage, context, sentiment) {
    let prompt = `User message: "${userMessage}"\n\n`;
    
    prompt += `Detected sentiment: ${sentiment.sentiment} (${sentiment.intensity} intensity)\n\n`;

    if (context) {
      prompt += `Current user context:\n`;
      prompt += `- DayScore: ${context.dayScore}/100\n`;
      prompt += `- Mood: ${context.mood}/10\n`;
      prompt += `- Tasks: ${context.completedTasks}/${context.totalTasks} completed\n`;
      prompt += `- Study time: ${context.studyTime} minutes\n`;
      prompt += `- Work time: ${context.workTime} minutes\n`;
      prompt += `- Sleep: ${context.sleep} hours\n`;
      
      if (context.horoscope) {
        prompt += `- Today's horoscope: ${context.horoscope.sign} ${context.horoscope.symbol} - "${context.horoscope.prediction}" (Vibe: ${context.horoscope.vibe})\n`;
      }
      
      prompt += `\n`;
    }

    switch (sentiment.sentiment) {
      case 'negative':
        prompt += `IMPORTANT: This user needs emotional support. Prioritize empathy and validation over productivity advice. Make them feel understood and cared for.`;
        break;
      case 'positive':
        prompt += `This user is in a positive state. Celebrate with them and help them build on this positive momentum.`;
        break;
      case 'seeking_help':
        prompt += `This user is seeking guidance. Provide helpful, practical advice tailored to their situation.`;
        break;
      default:
        prompt += `Engage in natural conversation and gently explore how you can best support them.`;
    }

    return prompt;
  }

  // Sentiment-based fallback responses
  generateSentimentBasedFallback(userMessage, context, sentiment) {
    switch (sentiment.sentiment) {
      case 'negative':
        return this.getNegativeSentimentResponse(sentiment.intensity, context);
      case 'positive':
        return this.getPositiveSentimentResponse(sentiment.intensity, context);
      case 'seeking_help':
        return this.getHelpSeekingResponse(userMessage, context);
      default:
        return this.getNeutralResponse(context);
    }
  }

  getNegativeSentimentResponse(intensity, context) {
    const responses = intensity === 'high' ? [
      {
        content: "I can hear that you're going through a really tough time right now, and I want you to know that your feelings are completely valid. You don't have to carry this alone.\n\nWhatever you're facing, it's okay to feel overwhelmed. You're human, and humans aren't meant to be strong all the time. Sometimes the most courageous thing we can do is acknowledge when we're struggling.\n\nI'm here with you. Take a deep breath. You matter, and this difficult moment will pass. What's weighing most heavily on your heart right now?",
        sentiment: { sentiment: 'negative', intensity: 'high' }
      },
      {
        content: "I can feel the weight of what you're going through, and I want you to know that it's completely okay to not be okay right now. Your pain is real, and it matters.\n\nYou're being so brave by reaching out, even when everything feels hard. That takes real strength. Please remember that your worth isn't determined by how you're feeling today or what you're able to accomplish.\n\nYou are enough, exactly as you are, in this moment. What would feel most supportive for you right now?",
        sentiment: { sentiment: 'negative', intensity: 'high' }
      }
    ] : [
      {
        content: "I can sense that things feel challenging right now, and I want you to know that what you're experiencing is completely valid. It's okay to have difficult days.\n\nYou're not alone in feeling this way. Sometimes life feels heavy, and that's part of the human experience. You don't have to push through or pretend everything is fine.\n\nTake a moment to be gentle with yourself. You're doing better than you think. What's been on your mind lately?",
        sentiment: { sentiment: 'negative', intensity: 'moderate' }
      }
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getPositiveSentimentResponse(intensity, context) {
    const responses = [
      {
        content: "I can feel the positive energy in your message, and it absolutely brightens my day! 🌟 There's something beautiful about sharing good vibes, and I'm so glad you're experiencing this.\n\nYour positivity is contagious, and I love seeing you in this space. When we're feeling good, it's the perfect time to appreciate the moment and maybe even build on this momentum.\n\nWhat's bringing you this joy today? I'd love to celebrate with you!",
        sentiment: { sentiment: 'positive', intensity: 'high' }
      },
      {
        content: "It's wonderful to hear the positivity in your message! 😊 There's something really special about connecting when you're in a good headspace.\n\nI love that you're taking a moment to share this energy. Positive moments like these are precious, and they remind us of what's possible even on the tougher days.\n\nHow are you feeling about everything else in your life right now? I'm here to chat about whatever's on your mind!",
        sentiment: { sentiment: 'positive', intensity: 'moderate' }
      }
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getHelpSeekingResponse(userMessage, context) {
    return {
      content: "I'm really glad you reached out for help - that shows wisdom and self-awareness. I'm here to support you in whatever way I can.\n\nLet me understand what you're looking for. Whether it's practical advice, emotional support, or just someone to think through things with, I want to make sure I'm giving you exactly what would be most helpful.\n\nCan you tell me a bit more about what's on your mind? I'm listening and ready to help however I can.",
      sentiment: { sentiment: 'seeking_help', intensity: 'moderate' }
    };
  }

  getNeutralResponse(context) {
    return {
      content: "Thanks for reaching out! I'm here and ready to chat about whatever's on your mind. Whether you want to talk about productivity, wellness, how your day is going, or just need someone to listen, I'm here for you.\n\nI'm curious - how are you feeling today? What's been occupying your thoughts lately?",
      sentiment: { sentiment: 'neutral', intensity: 'low' }
    };
  }

  getErrorResponse() {
    return {
      content: "I'm having a bit of trouble connecting right now, but I'm still here for you! 💙 Try telling me how you're feeling or what's on your mind, and I'll do my best to help.",
      sentiment: { sentiment: 'neutral', intensity: 'low' }
    };
  }

  // Conversation history management
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content, timestamp: new Date() });
    
    // Keep only recent history
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  getRecentHistory() {
    // Return last 6 messages for context (3 exchanges)
    return this.conversationHistory.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

const chatService = new ChatService();
export default chatService;
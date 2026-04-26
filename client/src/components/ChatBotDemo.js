import React, { useState } from 'react';
import { MessageCircle, Bot, Sparkles, Heart, Zap, Target, Moon } from 'lucide-react';

const ChatBotDemo = () => {
  const [activeDemo, setActiveDemo] = useState(null);

  const demoScenarios = [
    {
      id: 'progress',
      title: 'Progress Check',
      icon: Target,
      color: 'blue',
      description: 'Ask about your daily progress and get detailed insights',
      example: 'How am I doing today?',
      response: `Here's your current progress:

📊 DayScore: 75/100
✅ Tasks: 3/5 completed (60%)
😊 Mood: 7/10
📚 Study Time: 45 minutes
💼 Work Time: 120 minutes

👍 You're doing well today! There's always room to grow, but you should feel proud of your progress.`
    },
    {
      id: 'emotional',
      title: 'Emotional Support',
      icon: Heart,
      color: 'purple',
      description: 'Get empathetic support during difficult times',
      example: 'I\'m feeling really stressed',
      response: `I hear you, and what you're feeling is completely valid. Stress is your mind's way of saying it cares about what matters to you. Let's take this one breath at a time.

🌸 Right now, try this:
• Take 3 deep breaths with me
• Name 3 things you can see around you
• Remember: this feeling will pass

You don't have to carry this alone. What's weighing on your mind the most right now?`
    },
    {
      id: 'motivation',
      title: 'Motivation Boost',
      icon: Zap,
      color: 'yellow',
      description: 'Get energized and motivated to tackle your goals',
      example: 'I need some motivation',
      response: `✨ You have everything within you to create the day you want. Every small action is a vote for the person you're becoming.

🔥 Remember:
• Your effort today shapes your tomorrow
• Small steps lead to big changes
• You've overcome challenges before
• Your consistency is your superpower

What's one small thing you could do right now that your future self would thank you for?`
    },
    {
      id: 'wellness',
      title: 'Wellness Guidance',
      icon: Moon,
      color: 'indigo',
      description: 'Get advice on sleep, health, and self-care',
      example: 'I\'m having trouble sleeping',
      response: `💤 I notice you're having trouble with sleep. Your mind and body are asking for rest, and that's not weakness - it's wisdom.

🌙 Sleep is your superpower:
• Better focus and memory
• Improved mood and resilience
• Stronger immune system
• Better decision-making

Tonight, try:
• Set a bedtime alarm
• No screens 1 hour before bed
• Keep your room cool and dark
• Try some gentle stretching

Your future self will thank you for prioritizing rest.`
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      indigo: 'bg-indigo-500 text-white'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DayScore AI Chatbot</h1>
        <p className="text-lg text-gray-600 mb-4">
          Your intelligent companion that understands your emotions and responds with empathy
        </p>
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Sparkles className="w-4 h-4 mr-2" />
          Powered by sentiment analysis • Emotionally intelligent responses
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {demoScenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          return (
            <div
              key={scenario.id}
              className={`
                card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
                ${activeDemo === scenario.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}
              `}
              onClick={() => setActiveDemo(activeDemo === scenario.id ? null : scenario.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(scenario.color)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{scenario.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 font-medium">Try saying:</p>
                    <p className="text-sm text-blue-600 italic">"{scenario.example}"</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Response */}
      {activeDemo && (
        <div className="card p-6 animate-fadeInChat">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">DayScore AI Response</h4>
              <p className="text-xs text-gray-500">Contextual • Empathetic • Actionable</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
              {demoScenarios.find(s => s.id === activeDemo)?.response}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Smart Suggestions</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Context Aware</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Emotionally Intelligent</span>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-sm text-gray-600">Advanced GPT-4 integration for intelligent, contextual responses</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Emotionally Aware</h3>
          <p className="text-sm text-gray-600">Provides empathetic support and validates your feelings</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Goal-Oriented</h3>
          <p className="text-sm text-gray-600">Helps you stay focused and achieve your productivity goals</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Chat?</h2>
          <p className="text-blue-100 mb-6">
            Look for the chat button in the bottom-right corner of your screen. 
            Your AI companion is ready to help with productivity, wellness, and emotional support.
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-100">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Click the chat button to get started</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotDemo;
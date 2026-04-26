import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, Sparkles } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useServerAuth } from '../context/ServerAuthContext';
import { useData } from '../context/DataContext';
import chatService from '../services/chatService';
import horoscopeService from '../services/horoscopeService';
import vibeService from '../services/vibeService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useServerAuth();
  const { buildUserContext, aiAvailable } = useAI();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hi ${user.name || 'there'}! 👋 I'm your DayScore AI companion. I'm here to listen and support you with whatever you're going through - whether it's productivity challenges, wellness goals, or just needing someone to talk to. How are you feeling today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  // Handle sending messages
  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const context = buildUserContext();
      
      // Add horoscope context if available
      const zodiacSign = horoscopeService.getUserZodiacSign();
      if (zodiacSign) {
        const todayHoroscope = horoscopeService.getTodayHoroscope(zodiacSign);
        if (todayHoroscope) {
          context.horoscope = {
            sign: todayHoroscope.name,
            symbol: todayHoroscope.symbol,
            prediction: todayHoroscope.prediction,
            vibe: todayHoroscope.vibe
          };
        }
      }
      
      const response = await chatService.generateChatResponse(text, context);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.content,
          timestamp: new Date(),
          sentiment: response.sentiment
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        if (!isOpen) {
          setHasNewMessage(true);
        }
      }, 1000 + Math.random() * 1000);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. But I'm still here for you! Tell me what's on your mind or how you're feeling, and I'll do my best to help.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-20 z-[60]">
          <button
            onClick={toggleChat}
            className={`
              relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 
              hover:from-blue-600 hover:to-purple-700 text-white rounded-full 
              shadow-lg hover:shadow-xl transition-all duration-300 
              flex items-center justify-center group
              ${hasNewMessage ? 'animate-pulse' : ''}
            `}
          >
            <MessageCircle className="w-6 h-6" />
            
            {/* New message indicator */}
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Chat with DayScore AI
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`
          fixed bottom-4 right-20 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60]
          transition-all duration-300 transform
          ${isMinimized ? 'h-16' : 'h-[600px]'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">DayScore AI</h3>
                <p className="text-xs opacity-90">
                  {aiAvailable ? 'Online' : 'Offline'} • Always here for you
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[80%] rounded-2xl px-4 py-3 chat-message
                      ${message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {message.type === 'bot' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600">DayScore AI</span>
                          {message.sentiment && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              message.sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-600' :
                              message.sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-600' :
                              message.sentiment.sentiment === 'seeking_help' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {message.sentiment.sentiment === 'negative' ? '💙 Support' :
                               message.sentiment.sentiment === 'positive' ? '🌟 Celebrate' :
                               message.sentiment.sentiment === 'seeking_help' ? '🤝 Help' :
                               '💬 Chat'}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      <div className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-white' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-purple-500" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isTyping}
                      className={`
                        absolute right-2 top-1/2 transform -translate-y-1/2 
                        w-8 h-8 rounded-full flex items-center justify-center
                        transition-all duration-200
                        ${inputMessage.trim() && !isTyping
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by DayScore AI
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
import React, { useState, useEffect } from 'react';
import { X, Heart, Zap, AlertTriangle, Star, Coffee } from 'lucide-react';

const AIPopup = ({ popup, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-close for certain popup types
    if (popup.intent === 'praise' || popup.intent === 'motivate') {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 6000);
      return () => clearTimeout(autoCloseTimer);
    }
  }, [popup.intent]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (popup.cta && onAction) {
      onAction(popup);
    }
    handleClose();
  };

  const getPopupConfig = () => {
    switch (popup.intent) {
      case 'praise':
      case 'motivate':
        return {
          position: 'bottom-right',
          background: 'bg-gradient-to-r from-blue-500 to-purple-500',
          textColor: 'text-white',
          icon: <Star className="w-5 h-5" />,
          animation: 'animate-slideUp',
          backdrop: false
        };
      
      case 'console':
        return {
          position: 'center',
          background: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200',
          textColor: 'text-gray-800',
          icon: <Heart className="w-6 h-6 text-purple-500" />,
          animation: 'animate-fadeIn',
          backdrop: true
        };
      
      case 'warn':
        return {
          position: 'top-center',
          background: 'bg-gradient-to-r from-orange-400 to-yellow-400',
          textColor: 'text-white',
          icon: <AlertTriangle className="w-5 h-5" />,
          animation: 'animate-slideDown',
          backdrop: false
        };
      
      case 'nudge':
        return {
          position: 'bottom-left',
          background: 'bg-white border-l-4 border-blue-500 shadow-lg',
          textColor: 'text-gray-800',
          icon: <Zap className="w-5 h-5 text-blue-500" />,
          animation: 'animate-slideUp',
          backdrop: false
        };
      
      default:
        return {
          position: 'bottom-right',
          background: 'bg-white shadow-lg border border-gray-200',
          textColor: 'text-gray-800',
          icon: <Coffee className="w-5 h-5 text-gray-500" />,
          animation: 'animate-slideUp',
          backdrop: false
        };
    }
  };

  const config = getPopupConfig();

  const getPositionClasses = () => {
    switch (config.position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4';
      case 'bottom-left':
        return 'fixed bottom-4 left-4';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
      default:
        return 'fixed bottom-4 right-4';
    }
  };

  return (
    <>
      {/* Backdrop for center popups */}
      {config.backdrop && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />
      )}

      {/* Popup Container */}
      <div
        className={`
          ${getPositionClasses()}
          ${config.position === 'center' ? 'w-96 max-w-lg' : 'w-80 max-w-sm'} 
          rounded-xl p-6 transition-all duration-300 transform
          ${config.background} ${config.textColor}
          ${isVisible && !isClosing ? 'opacity-100 scale-100 translate-y-0' : 
            config.position === 'top-center' ? 'opacity-0 scale-95 -translate-y-2' :
            'opacity-0 scale-95 translate-y-2'}
          ${config.backdrop ? 'z-50' : 'z-40'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {config.icon}
            <span className="text-sm font-medium opacity-80">
              {popup.intent === 'console' ? 'You\'re Not Alone' :
               popup.intent === 'praise' ? 'Well Done!' :
               popup.intent === 'warn' ? 'Gentle Reminder' :
               popup.intent === 'nudge' ? 'Kind Suggestion' :
               'DayScore Companion'}
            </span>
          </div>
          
          {/* Close button - only for persistent popups */}
          {(popup.intent === 'warn' || popup.intent === 'console') && (
            <button
              onClick={handleClose}
              className={`p-1 rounded-full transition-colors ${
                config.textColor === 'text-white' 
                  ? 'hover:bg-white hover:bg-opacity-20' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className={`mb-4 ${popup.intent === 'console' ? 'mb-6' : ''}`}>
          <p className={`
            ${popup.intent === 'console' ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'}
            ${popup.intent === 'console' ? 'text-gray-700' : ''}
          `}>
            {popup.message}
          </p>
        </div>

        {/* Action Button */}
        {popup.cta && (
          <div className="flex justify-end">
            <button
              onClick={handleAction}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${popup.intent === 'console' 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : popup.intent === 'warn'
                  ? 'bg-white text-orange-600 hover:bg-gray-50'
                  : popup.intent === 'nudge'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }
              `}
            >
              {popup.cta}
            </button>
          </div>
        )}

        {/* Auto-close indicator for praise/motivate */}
        {(popup.intent === 'praise' || popup.intent === 'motivate') && (
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="h-full bg-white bg-opacity-60 rounded-full animate-shrink" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIPopup;
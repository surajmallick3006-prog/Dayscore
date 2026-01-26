import React from 'react';

const Logo = ({ size = 32, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring segments */}
        {/* Top segment - Yellow/Orange */}
        <path
          d="M50 10 A40 40 0 0 1 78.28 21.72 L71.21 28.79 A30 30 0 0 0 50 20 Z"
          fill="url(#gradient1)"
        />
        
        {/* Top-right segment - Orange */}
        <path
          d="M78.28 21.72 A40 40 0 0 1 89.28 50 L79.28 50 A30 30 0 0 0 71.21 28.79 Z"
          fill="url(#gradient2)"
        />
        
        {/* Right segment - Orange/Pink */}
        <path
          d="M89.28 50 A40 40 0 0 1 78.28 78.28 L71.21 71.21 A30 30 0 0 0 79.28 50 Z"
          fill="url(#gradient3)"
        />
        
        {/* Bottom-right segment - Pink/Purple */}
        <path
          d="M78.28 78.28 A40 40 0 0 1 50 90 L50 80 A30 30 0 0 0 71.21 71.21 Z"
          fill="url(#gradient4)"
        />
        
        {/* Bottom segment - Purple/Blue */}
        <path
          d="M50 90 A40 40 0 0 1 21.72 78.28 L28.79 71.21 A30 30 0 0 0 50 80 Z"
          fill="url(#gradient5)"
        />
        
        {/* Bottom-left segment - Blue */}
        <path
          d="M21.72 78.28 A40 40 0 0 1 10.72 50 L20.72 50 A30 30 0 0 0 28.79 71.21 Z"
          fill="url(#gradient6)"
        />
        
        {/* Left segment - Blue/Cyan */}
        <path
          d="M10.72 50 A40 40 0 0 1 21.72 21.72 L28.79 28.79 A30 30 0 0 0 20.72 50 Z"
          fill="url(#gradient7)"
        />
        
        {/* Top-left segment - Green */}
        <path
          d="M21.72 21.72 A40 40 0 0 1 50 10 L50 20 A30 30 0 0 0 28.79 28.79 Z"
          fill="url(#gradient8)"
        />

        {/* Inner circle with gradient and checkmark/arrow */}
        <circle cx="50" cy="50" r="25" fill="url(#innerGradient)" />
        
        {/* White checkmark/arrow in center */}
        <path
          d="M40 50 L46 56 L62 40"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Sun rays in top section */}
        <g stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="50" y1="30" x2="50" y2="35" />
          <line x1="42" y1="32" x2="43" y2="37" />
          <line x1="58" y1="32" x2="57" y2="37" />
          <line x1="36" y1="38" x2="39" y2="41" />
          <line x1="64" y1="38" x2="61" y2="41" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
          
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
          
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#E91E63" />
          </linearGradient>
          
          <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E91E63" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>
          
          <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C27B0" />
            <stop offset="100%" stopColor="#3F51B5" />
          </linearGradient>
          
          <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3F51B5" />
            <stop offset="100%" stopColor="#2196F3" />
          </linearGradient>
          
          <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2196F3" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
          
          <radialGradient id="innerGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="30%" stopColor="#FFA500" />
            <stop offset="60%" stopColor="#FF6B6B" />
            <stop offset="80%" stopColor="#9C27B0" />
            <stop offset="100%" stopColor="#2196F3" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
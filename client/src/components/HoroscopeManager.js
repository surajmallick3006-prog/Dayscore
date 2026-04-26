import React, { useState, useEffect } from 'react';
import ZodiacSelector from './ZodiacSelector';
import DailyHoroscopeCard from './DailyHoroscopeCard';
import horoscopeService from '../services/horoscopeService';

const HoroscopeManager = () => {
  const [showZodiacSelector, setShowZodiacSelector] = useState(false);
  const [userHasZodiac, setUserHasZodiac] = useState(false);

  useEffect(() => {
    // Check if user has already set their zodiac sign
    const hasZodiac = horoscopeService.hasZodiacSign();
    setUserHasZodiac(hasZodiac);
    
    // Show selector if user doesn't have zodiac sign set
    if (!hasZodiac) {
      // Delay showing the selector to avoid overwhelming new users
      const timer = setTimeout(() => {
        setShowZodiacSelector(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleZodiacSelect = (zodiacData) => {
    horoscopeService.setUserZodiacSign(zodiacData.sign);
    setUserHasZodiac(true);
    setShowZodiacSelector(false);
  };

  const handleEditZodiac = () => {
    setShowZodiacSelector(true);
  };

  const handleCloseSelector = () => {
    setShowZodiacSelector(false);
  };

  return (
    <>
      {/* Show horoscope card if user has zodiac sign */}
      {userHasZodiac && (
        <DailyHoroscopeCard onEditZodiac={handleEditZodiac} />
      )}

      {/* Show zodiac selector modal */}
      {showZodiacSelector && (
        <ZodiacSelector
          onSelect={handleZodiacSelect}
          onClose={handleCloseSelector}
        />
      )}
    </>
  );
};

export default HoroscopeManager;
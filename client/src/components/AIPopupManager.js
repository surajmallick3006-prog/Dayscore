import React from 'react';
import { useAI } from '../context/AIContext';
import AIPopup from './AIPopup';

const AIPopupManager = () => {
  const { currentPopup, handlePopupAction, closePopup } = useAI();

  if (!currentPopup) return null;

  return (
    <AIPopup
      popup={currentPopup}
      onClose={closePopup}
      onAction={handlePopupAction}
    />
  );
};

export default AIPopupManager;
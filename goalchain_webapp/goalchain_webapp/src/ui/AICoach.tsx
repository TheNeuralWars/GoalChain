import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const AICoach = ({ language }) => {
  return (
    <div className="ai-coach">
      <h1>{TRANSLATIONS[language].aiCoachTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default AICoach;
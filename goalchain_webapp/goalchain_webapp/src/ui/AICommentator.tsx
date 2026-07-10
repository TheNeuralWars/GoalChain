import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const AICommentator = ({ language }) => {
  return (
    <div className="ai-commentator">
      <h1>{TRANSLATIONS[language].aiCommentatorTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default AICommentator;
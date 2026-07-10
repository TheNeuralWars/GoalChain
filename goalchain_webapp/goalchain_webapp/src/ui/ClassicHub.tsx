import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const ClassicHub = ({ language }) => {
  return (
    <div className="classic-hub">
      <h1>{TRANSLATIONS[language].classicHubTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default ClassicHub;
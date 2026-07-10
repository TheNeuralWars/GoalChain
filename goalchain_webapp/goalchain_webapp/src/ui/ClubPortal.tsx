import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const ClubPortal = ({ language }) => {
  return (
    <div className="club-portal">
      <h1>{TRANSLATIONS[language].clubPortalTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default ClubPortal;
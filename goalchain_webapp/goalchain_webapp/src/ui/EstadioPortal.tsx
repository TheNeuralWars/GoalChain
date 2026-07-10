import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const EstadioPortal = ({ language }) => {
  return (
    <div className="estadio-portal">
      <h1>{TRANSLATIONS[language].estadioPortalTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default EstadioPortal;
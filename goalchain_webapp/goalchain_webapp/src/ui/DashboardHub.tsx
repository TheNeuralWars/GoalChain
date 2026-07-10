import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const DashboardHub = ({ language }) => {
  return (
    <div className="dashboard-hub">
      <h1>{TRANSLATIONS[language].dashboardHubTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default DashboardHub;
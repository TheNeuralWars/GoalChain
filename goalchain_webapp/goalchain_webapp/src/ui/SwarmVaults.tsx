import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const SwarmVaults = ({ language }) => {
  return (
    <div className="swarm-vaults">
      <h1>{TRANSLATIONS[language].swarmVaultsTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default SwarmVaults;
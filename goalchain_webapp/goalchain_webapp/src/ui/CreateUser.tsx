import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const CreateUser = ({ language }) => {
  return (
    <div className="create-user">
      <h1>{TRANSLATIONS[language].createUserTitle}</h1>
      {/* Rest of the component */}
    </div>
  );
}

export default CreateUser;
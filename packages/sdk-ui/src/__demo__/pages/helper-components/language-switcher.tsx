import React, { useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC<{}> = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    void i18n.changeLanguage(newLanguage);
    setSelectedLanguage(newLanguage);
  };

  return (
    <div>
      <label htmlFor="languageSelect">Select Language:</label>
      <select
        id="languageSelect"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        style={{ border: '1px solid grey', borderRadius: '5px' }}
      >
        <option value="en">English</option>
        <option value="uk">Ukrainian</option>
        <option value="zu">Zulu (unsupported)</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();
  

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center pt-16">
      <h1 className="text-6xl font-bold text-primary mb-4">{t('notFound.title')}</h1>
      <p className="text-xl text-gray-600 mb-8">{t('notFound.desc')}</p>
      <Link to="/" className="btn-primary">{t('notFound.goHome')}</Link>
    </div>
  );
};

export default NotFound;

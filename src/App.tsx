import { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';
import type { Language, ModuleType } from './types';
import { getLanguage, saveLanguage } from './services/storageService';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import PancreatitisModule from './modules/pancreatitis/PancreatitisModule';
import MolecuLearnModule from './modules/moleculearn/MolecuLearnModule';
import HealthProModule from './modules/healthpro/HealthProModule';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load saved language preference
    const savedLang = getLanguage();
    setLanguage(savedLang);

    // Apply language class to body for font
    document.body.className = savedLang === 'te' ? 'lang-te' : '';
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
    document.body.className = lang === 'te' ? 'lang-te' : '';
  }, []);

  const handleModuleChange = useCallback((module: ModuleType) => {
    setCurrentModule(module);
  }, []);

  const moduleContent = useMemo(() => {
    switch (currentModule) {
      case 'pancreatitis':
        return <PancreatitisModule language={language} />;
      case 'moleculearn':
        return <MolecuLearnModule language={language} />;
      case 'healthpro':
        return <HealthProModule language={language} />;
      default:
        return <HomePage setCurrentModule={handleModuleChange} language={language} />;
    }
  }, [currentModule, language, handleModuleChange]);

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      {/* Animated Background */}
      <div className="app-background" aria-hidden="true">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Header */}
      <Header
        currentModule={currentModule}
        setCurrentModule={handleModuleChange}
        language={language}
        setLanguage={handleLanguageChange}
      />

      {/* Main Content */}
      <main className="main-content" role="main">
        {moduleContent}
      </main>

      {/* Footer */}
      <Footer language={language} />
    </ErrorBoundary>
  );
}

export default App;

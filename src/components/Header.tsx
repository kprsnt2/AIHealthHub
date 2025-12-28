import { useState, useCallback, useEffect } from 'react';
import type { Language, ModuleType } from '../types';
import { t } from '../i18n/translations';
import './Header.css';

interface HeaderProps {
    currentModule: ModuleType;
    setCurrentModule: (module: ModuleType) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export default function Header({
    currentModule,
    setCurrentModule,
    language,
    setLanguage
}: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.header')) {
                setMobileMenuOpen(false);
            }
        };

        if (mobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => document.removeEventListener('click', handleClickOutside);
    }, [mobileMenuOpen]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleLogoClick = useCallback(() => {
        setCurrentModule('home');
        setMobileMenuOpen(false);
    }, [setCurrentModule]);

    const handleLogoKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCurrentModule('home');
        }
    }, [setCurrentModule]);

    const handleNavClick = useCallback((module: ModuleType) => {
        setCurrentModule(module);
        setMobileMenuOpen(false);
    }, [setCurrentModule]);

    const handleLanguageChange = useCallback((lang: Language) => {
        setLanguage(lang);
    }, [setLanguage]);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    return (
        <header className="header" role="banner">
            <div className="header-content">
                <div
                    className="logo"
                    onClick={handleLogoClick}
                    onKeyDown={handleLogoKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label={t('goToHome', language)}
                >
                    <img src="/logo.png" alt="" className="logo-img" aria-hidden="true" />
                    <span>{t('appName', language)}</span>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-expanded={mobileMenuOpen}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Navigation - Desktop & Mobile */}
                <nav
                    className={`nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}
                    role="navigation"
                    aria-label={t('toggleNavigation', language)}
                >
                    <button
                        className={`nav-tab ${currentModule === 'home' ? 'active' : ''}`}
                        onClick={() => handleNavClick('home')}
                        aria-current={currentModule === 'home' ? 'page' : undefined}
                    >
                        <span aria-hidden="true">🏠</span> {t('home', language)}
                    </button>
                    <button
                        className={`nav-tab digestivehealth ${currentModule === 'digestivehealth' ? 'active' : ''}`}
                        onClick={() => handleNavClick('digestivehealth')}
                        aria-current={currentModule === 'digestivehealth' ? 'page' : undefined}
                    >
                        <span aria-hidden="true">💚</span> {t('digestivehealth', language)}
                    </button>
                    <button
                        className={`nav-tab moleculearn ${currentModule === 'moleculearn' ? 'active' : ''}`}
                        onClick={() => handleNavClick('moleculearn')}
                        aria-current={currentModule === 'moleculearn' ? 'page' : undefined}
                    >
                        <span aria-hidden="true">💊</span> {t('moleculearn', language)}
                    </button>
                    <button
                        className={`nav-tab healthpro ${currentModule === 'healthpro' ? 'active' : ''}`}
                        onClick={() => handleNavClick('healthpro')}
                        aria-current={currentModule === 'healthpro' ? 'page' : undefined}
                    >
                        <span aria-hidden="true">🩺</span> {t('healthpro', language)}
                    </button>
                </nav>

                <div className="header-controls">
                    <div
                        className="language-toggle"
                        role="group"
                        aria-label={t('changeLanguage', language)}
                    >
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('en')}
                            aria-pressed={language === 'en'}
                            aria-label="Switch to English"
                        >
                            EN
                        </button>
                        <button
                            className={`lang-btn ${language === 'te' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('te')}
                            aria-pressed={language === 'te'}
                            aria-label="తెలుగు (Telugu) కు మారండి"
                        >
                            తె
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

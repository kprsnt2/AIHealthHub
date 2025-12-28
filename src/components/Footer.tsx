import { useCallback } from 'react';
import type { Language } from '../types';
import { t } from '../i18n/translations';
import './Footer.css';

interface FooterProps {
    language: Language;
}

export default function Footer({ language }: FooterProps) {
    const currentYear = new Date().getFullYear();

    const handlePrivacyClick = useCallback(() => {
        window.open('/privacy-policy.html', '_blank', 'noopener,noreferrer');
    }, []);

    const handleTermsClick = useCallback(() => {
        window.open('/terms-of-service.html', '_blank', 'noopener,noreferrer');
    }, []);

    return (
        <footer className="footer" role="contentinfo">
            {/* Medical Disclaimer */}
            <div className="footer-disclaimer">
                <span className="disclaimer-icon" aria-hidden="true">⚠️</span>
                <p>
                    {language === 'te'
                        ? 'ముఖ్యమైన గమనిక: ఈ అప్లికేషన్ కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే. ఇది వృత్తిపరమైన వైద్య సలహా, రోగ నిర్ధారణ లేదా చికిత్సకు ప్రత్యామ్నాయం కాదు. ఎల్లప్పుడూ అర్హత కలిగిన వైద్య నిపుణులను సంప్రదించండి.'
                        : 'Important: This application is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals.'
                    }
                </p>
            </div>

            <div className="footer-content">
                {/* Navigation Links */}
                <div className="footer-links">
                    <button
                        className="footer-link"
                        onClick={handlePrivacyClick}
                        aria-label={t('privacyPolicy', language)}
                    >
                        {language === 'te' ? 'గోప్యతా విధానం' : 'Privacy Policy'}
                    </button>
                    <span className="footer-divider" aria-hidden="true">•</span>
                    <button
                        className="footer-link"
                        onClick={handleTermsClick}
                        aria-label={t('termsOfService', language)}
                    >
                        {language === 'te' ? 'సేవా నిబంధనలు' : 'Terms of Service'}
                    </button>
                </div>

                {/* Copyright */}
                <div className="footer-copyright">
                    <p>© {currentYear} AI Health Hub. {language === 'te' ? 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.' : 'All rights reserved.'}</p>
                    <p className="version">v1.0.0</p>
                </div>
            </div>
        </footer>
    );
}

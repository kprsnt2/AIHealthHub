import type { Language, ModuleType } from '../types';
import { t } from '../i18n/translations';

interface HomePageProps {
    setCurrentModule: (module: ModuleType) => void;
    language: Language;
}

export default function HomePage({ setCurrentModule, language }: HomePageProps) {
    const modules = [
        {
            id: 'digestivehealth' as ModuleType,
            icon: '💚',
            title: t('digestivehealth', language),
            description: t('digestiveHealthDesc', language),
            className: 'digestivehealth',
            features: [t('diseaseCheck', language), t('chatWithAI', language), t('healthyFood', language)]
        },
        {
            id: 'moleculearn' as ModuleType,
            icon: '💊',
            title: t('moleculearn', language),
            description: t('moleculearnDesc', language),
            className: 'moleculearn',
            features: [t('drugInfo', language), t('alternatives', language), t('naturalRemedies', language)]
        },
        {
            id: 'healthpro' as ModuleType,
            icon: '🩺',
            title: t('healthpro', language),
            description: t('healthproDesc', language),
            className: 'healthpro',
            features: [t('symptomAnalysis', language), t('secondOpinion', language), t('dietPlan', language)]
        }
    ];

    return (
        <div className="home-page">
            <div className="home-hero">
                <h1 className="hero-title">{t('appName', language)}</h1>
                <p className="hero-subtitle">{t('appTagline', language)}</p>
            </div>

            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {t('exploreModules', language)}
            </h2>

            <div className="modules-grid">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        className={`module-card ${module.className}`}
                        onClick={() => setCurrentModule(module.id)}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="module-icon">{module.icon}</span>
                        <h3 className="module-title">{module.title}</h3>
                        <p className="module-description">{module.description}</p>
                        <div className="module-features">
                            {module.features.map((feature, idx) => (
                                <span key={idx} className="feature-tag">{feature}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="disclaimer">
                <span className="disclaimer-icon">⚠️</span>
                <span>{t('disclaimer', language)}</span>
            </div>
        </div>
    );
}

import { useState, useCallback, useMemo } from 'react';
import type { Language, Message, HealthProfile } from '../../types';
import { t } from '../../i18n/translations';
import { getErrorMessage } from '../../utils/apiUtils';
import ChatInterface from '../../components/ChatInterface';
import DietTipsView from '../../components/DietTipsView';
import HealthProfileForm from '../../components/HealthProfileForm';
import SymptomResultView from '../../components/SymptomResultView';
import {
    chatAboutDigestiveHealth,
    checkDigestiveSymptoms,
    getPersonalizedDiet,
    getDigestiveHealthDiet
} from '../../services/geminiService';
import { generateId, getHealthProfile } from '../../services/storageService';

interface DigestiveHealthModuleProps {
    language: Language;
}

type TabType = 'check' | 'chat' | 'diet';

// General digestive health symptoms (not pancreatitis-specific)
const SYMPTOMS = {
    en: [
        'Abdominal pain',
        'Bloating or gas',
        'Nausea',
        'Vomiting',
        'Heartburn / Acid reflux',
        'Indigestion',
        'Constipation',
        'Diarrhea',
        'Loss of appetite',
        'Unexplained weight loss',
        'Blood in stool',
        'Difficulty swallowing',
        'Stomach cramps',
        'Fatigue after eating'
    ],
    te: [
        'పొట్ట నొప్పి',
        'ఉబ్బరం లేదా గ్యాస్',
        'వికారం',
        'వాంతులు',
        'గుండెల్లో మంట / యాసిడ్ రిఫ్లక్స్',
        'అజీర్ణం',
        'మలబద్ధకం',
        'విరేచనాలు',
        'ఆకలి లేకపోవడం',
        'అనూహ్య బరువు తగ్గడం',
        'మలంలో రక్తం',
        'మింగడంలో ఇబ్బంది',
        'కడుపు నొప్పులు',
        'తిన్న తర్వాత అలసట'
    ]
};

export default function DigestiveHealthModule({ language }: DigestiveHealthModuleProps) {
    const [activeTab, setActiveTab] = useState<TabType>('check');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [checkResult, setCheckResult] = useState<string>('');
    const [dietInfo, setDietInfo] = useState<string>('');
    const [userProfile, setUserProfile] = useState<HealthProfile | null>(getHealthProfile());

    const tabs = useMemo(() => [
        { id: 'check' as TabType, label: t('diseaseCheck', language), icon: '🔍' },
        { id: 'chat' as TabType, label: t('chatWithAI', language), icon: '💬' },
        { id: 'diet' as TabType, label: t('healthyFood', language), icon: '🥗' }
    ], [language]);

    const handleSymptomToggle = useCallback((symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    }, []);

    const handleSymptomCheck = useCallback(async () => {
        if (selectedSymptoms.length === 0) return;

        setIsLoading(true);
        try {
            const result = await checkDigestiveSymptoms(selectedSymptoms, language);
            setCheckResult(result);
        } catch (error) {
            console.error('Error checking symptoms:', error);
            setCheckResult(getErrorMessage(error, language));
        }
        setIsLoading(false);
    }, [selectedSymptoms, language]);

    const handleSendMessage = useCallback(async (content: string) => {
        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatAboutDigestiveHealth(content, chatHistory, language);

            const assistantMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: getErrorMessage(error, language),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
    }, [messages, language]);

    const handleLoadDiet = useCallback(async (profile?: HealthProfile | null) => {
        if (dietInfo) return; // Already loaded

        setIsLoading(true);
        try {
            let result: string;
            const profileToUse = profile || userProfile;

            if (profileToUse && (profileToUse.age || profileToUse.weight || profileToUse.conditions?.length)) {
                // Use personalized diet if we have profile data
                result = await getPersonalizedDiet({
                    age: profileToUse.age,
                    gender: profileToUse.gender,
                    weight: profileToUse.weight,
                    height: profileToUse.height,
                    conditions: profileToUse.conditions
                }, language);
            } else {
                // Fall back to generic diet tips
                result = await getDigestiveHealthDiet(language);
            }
            setDietInfo(result);
        } catch (error) {
            console.error('Error loading diet info:', error);
            setDietInfo(getErrorMessage(error, language));
        }
        setIsLoading(false);
    }, [dietInfo, language, userProfile]);

    const handleProfileSaved = useCallback((profile: HealthProfile) => {
        setUserProfile(profile);
        setDietInfo(''); // Clear previous diet info
        handleLoadDiet(profile);  // Load personalized diet
    }, [handleLoadDiet]);

    const handleTabChange = useCallback((tabId: TabType) => {
        setActiveTab(tabId);
        if (tabId === 'diet') {
            handleLoadDiet();
        }
    }, [handleLoadDiet]);

    const symptoms = SYMPTOMS[language];

    return (
        <div className="module-container animate-fadeInUp">
            <div className="module-header">
                <h1 className="module-title-large" style={{ color: 'var(--digestivehealth-primary)' }}>
                    💚 {t('digestiveHealthTitle', language)}
                </h1>
                <p className="module-subtitle">{t('digestiveHealthDesc', language)}</p>
            </div>

            <div className="tabs" role="tablist" aria-label={t('digestiveHealthTitle', language)}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'check' && (
                <div
                    id="panel-check"
                    role="tabpanel"
                    aria-labelledby="tab-check"
                    className="glass-card animate-fadeIn"
                >
                    <h3 className="section-title">{t('symptomsCheck', language)}</h3>
                    <p className="module-subtitle" style={{ marginBottom: '1.5rem' }}>
                        {t('symptomsDesc', language)}
                    </p>

                    <div
                        className="symptoms-grid"
                        role="group"
                        aria-label={t('symptomsDesc', language)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {symptoms.map((symptom, idx) => (
                            <label
                                key={idx}
                                className="symptom-checkbox"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: selectedSymptoms.includes(symptom)
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : 'var(--bg-glass)',
                                    border: `1px solid ${selectedSymptoms.includes(symptom)
                                        ? 'var(--accent-emerald)'
                                        : 'var(--border-subtle)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSymptoms.includes(symptom)}
                                    onChange={() => handleSymptomToggle(symptom)}
                                    style={{ accentColor: 'var(--accent-emerald)' }}
                                    aria-label={symptom}
                                />
                                <span>{symptom}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSymptomCheck}
                        disabled={selectedSymptoms.length === 0 || isLoading}
                        aria-busy={isLoading}
                        style={{
                            background: 'var(--digestivehealth-primary)',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
                                <span aria-live="polite">{t('loading', language)}</span>
                            </>
                        ) : (
                            <>🔍 {t('analyze', language)}</>
                        )}
                    </button>

                    {checkResult && (
                        <SymptomResultView content={checkResult} language={language} />
                    )}
                </div>
            )}

            {activeTab === 'chat' && (
                <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        placeholder={t('askAboutDigestiveHealth', language)}
                        language={language}
                    />
                </div>
            )}

            {activeTab === 'diet' && (
                <div
                    id="panel-diet"
                    role="tabpanel"
                    aria-labelledby="tab-diet"
                    className="glass-card animate-fadeIn"
                >
                    <HealthProfileForm
                        language={language}
                        onProfileSaved={handleProfileSaved}
                        autoExpand={!userProfile}
                    />

                    {isLoading ? (
                        <div className="empty-state" role="status" aria-live="polite">
                            <div className="loading-spinner" style={{ width: 40, height: 40 }} aria-hidden="true" />
                            <p style={{ marginTop: '1rem' }}>{t('loading', language)}</p>
                        </div>
                    ) : dietInfo ? (
                        <DietTipsView content={dietInfo} language={language} />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🥗</div>
                            <p className="empty-state-text">
                                {language === 'te'
                                    ? 'వ్యక్తిగత ఆహార చిట్కాల కోసం మీ ప్రొఫైల్‌ను సేవ్ చేయండి'
                                    : 'Save your profile to get personalized diet tips'
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="disclaimer" role="note">
                <span className="disclaimer-icon" aria-hidden="true">⚠️</span>
                <span>{t('disclaimer', language)}</span>
            </div>
        </div>
    );
}

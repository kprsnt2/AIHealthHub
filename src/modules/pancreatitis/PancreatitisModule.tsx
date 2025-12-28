import { useState, useCallback, useMemo } from 'react';
import type { Language, Message } from '../../types';
import { t } from '../../i18n/translations';
import { createSafeHtml } from '../../utils/sanitize';
import { getErrorMessage } from '../../utils/apiUtils';
import ChatInterface from '../../components/ChatInterface';
import {
    chatAboutPancreatitis,
    checkPancreatitisSymptoms,
    getPancreatitisDiet
} from '../../services/geminiService';
import { generateId } from '../../services/storageService';

interface PancreatitisModuleProps {
    language: Language;
}

type TabType = 'check' | 'chat' | 'diet';

const SYMPTOMS = {
    en: [
        'Upper abdominal pain',
        'Pain radiating to back',
        'Nausea',
        'Vomiting',
        'Weight loss',
        'Oily/fatty stools',
        'Bloating',
        'Fever',
        'Rapid pulse',
        'Tenderness in abdomen'
    ],
    te: [
        'పై పొట్ట నొప్పి',
        'వీపుకు వ్యాపించే నొప్పి',
        'వికారం',
        'వాంతులు',
        'బరువు తగ్గడం',
        'జిడ్డు/కొవ్వు మలం',
        'ఉబ్బరం',
        'జ్వరం',
        'వేగవంతమైన పల్స్',
        'పొట్టలో నొప్పి'
    ]
};

export default function PancreatitisModule({ language }: PancreatitisModuleProps) {
    const [activeTab, setActiveTab] = useState<TabType>('check');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [checkResult, setCheckResult] = useState<string>('');
    const [dietInfo, setDietInfo] = useState<string>('');

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
            const result = await checkPancreatitisSymptoms(selectedSymptoms, language);
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
            const response = await chatAboutPancreatitis(content, chatHistory, language);

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

    const handleLoadDiet = useCallback(async () => {
        if (dietInfo) return; // Already loaded

        setIsLoading(true);
        try {
            const result = await getPancreatitisDiet(language);
            setDietInfo(result);
        } catch (error) {
            console.error('Error loading diet info:', error);
            setDietInfo(getErrorMessage(error, language));
        }
        setIsLoading(false);
    }, [dietInfo, language]);

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
                <h1 className="module-title-large" style={{ color: 'var(--pancreatitis-primary)' }}>
                    💚 {t('pancreatitisTitle', language)}
                </h1>
                <p className="module-subtitle">{t('pancreatitisDesc', language)}</p>
            </div>

            <div className="tabs" role="tablist" aria-label={t('pancreatitisTitle', language)}>
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
                            background: 'var(--pancreatitis-primary)',
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
                        <div
                            className="result-box animate-fadeInUp"
                            role="region"
                            aria-label={t('symptomsCheck', language)}
                            style={{
                                padding: '1.5rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                borderLeft: '4px solid var(--pancreatitis-primary)'
                            }}
                        >
                            <div dangerouslySetInnerHTML={createSafeHtml(checkResult, 'var(--accent-emerald)')} />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'chat' && (
                <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        placeholder={t('askAboutPancreatitis', language)}
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
                    {isLoading ? (
                        <div className="empty-state" role="status" aria-live="polite">
                            <div className="loading-spinner" style={{ width: 40, height: 40 }} aria-hidden="true" />
                            <p style={{ marginTop: '1rem' }}>{t('loading', language)}</p>
                        </div>
                    ) : dietInfo ? (
                        <div
                            className="diet-content"
                            dangerouslySetInnerHTML={createSafeHtml(dietInfo, 'var(--accent-emerald)')}
                        />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🥗</div>
                            <p className="empty-state-text">{t('loading', language)}</p>
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

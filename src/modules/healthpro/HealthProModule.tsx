import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, HealthProfile, DiagnosisResult } from '../../types';
import { t } from '../../i18n/translations';
import { createSafeHtml } from '../../utils/sanitize';
import { getErrorMessage } from '../../utils/apiUtils';
import HealthProfileForm from '../../components/HealthProfileForm';
import DietTipsView from '../../components/DietTipsView';
import {
    analyzeSymptoms,
    getSecondOpinion,
    getPersonalizedDiet,
    getDigestiveHealthDiet
} from '../../services/geminiService';
import {
    getHealthProfile,
    saveHealthProfile,
    generateId
} from '../../services/storageService';

interface HealthProModuleProps {
    language: Language;
}

type TabType = 'symptoms' | 'secondopinion' | 'profile' | 'diet';

export default function HealthProModule({ language }: HealthProModuleProps) {
    const [activeTab, setActiveTab] = useState<TabType>('symptoms');
    const [isLoading, setIsLoading] = useState(false);

    // Symptom Analysis State
    const [symptomInput, setSymptomInput] = useState('');
    const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
    const [duration, setDuration] = useState('');
    const [bodyLocation, setBodyLocation] = useState('');
    const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);

    // Second Opinion State
    const [existingDiagnosis, setExistingDiagnosis] = useState('');
    const [currentSymptoms, setCurrentSymptoms] = useState('');
    const [secondOpinionResult, setSecondOpinionResult] = useState('');

    // Health Profile State
    const [profile, setProfile] = useState<HealthProfile>({
        id: generateId(),
        age: 0,
        gender: '',
        conditions: [],
        medications: [],
        allergies: [],
        lastUpdated: new Date()
    });
    const [newCondition, setNewCondition] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const [newAllergy, setNewAllergy] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);

    // Diet Plan State
    const [dietPlanResult, setDietPlanResult] = useState('');

    useEffect(() => {
        const savedProfile = getHealthProfile();
        if (savedProfile) {
            setProfile(savedProfile);
        }
    }, []);

    const tabs = useMemo(() => [
        { id: 'symptoms' as TabType, label: t('symptomAnalysis', language), icon: '🔍' },
        { id: 'secondopinion' as TabType, label: t('secondOpinion', language), icon: '🩺' },
        { id: 'diet' as TabType, label: t('dietPlan', language), icon: '🥗' },
        { id: 'profile' as TabType, label: t('healthProfile', language), icon: '👤' }
    ], [language]);

    const handleSymptomAnalysis = useCallback(async () => {
        if (!symptomInput.trim()) return;

        setIsLoading(true);
        try {
            const profileData = profile.age > 0 ? {
                conditions: profile.conditions,
                medications: profile.medications,
                allergies: profile.allergies
            } : null;

            const results = await analyzeSymptoms(
                symptomInput,
                severity,
                duration,
                bodyLocation,
                profileData,
                language
            );
            setDiagnosisResults(results);
        } catch (error) {
            console.error('Error analyzing symptoms:', error);
        }
        setIsLoading(false);
    }, [symptomInput, severity, duration, bodyLocation, profile, language]);

    const handleSecondOpinion = useCallback(async () => {
        if (!existingDiagnosis.trim()) return;

        setIsLoading(true);
        try {
            const result = await getSecondOpinion(
                existingDiagnosis,
                currentSymptoms,
                language
            );
            setSecondOpinionResult(result);
        } catch (error) {
            console.error('Error getting second opinion:', error);
            setSecondOpinionResult(getErrorMessage(error, language));
        }
        setIsLoading(false);
    }, [existingDiagnosis, currentSymptoms, language]);

    const handleSaveProfile = useCallback(() => {
        const updatedProfile = { ...profile, lastUpdated: new Date() };
        saveHealthProfile(updatedProfile);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
    }, [profile]);

    const handleLoadDiet = useCallback(async (profileData?: HealthProfile | null) => {
        if (dietPlanResult) return; // Already loaded

        setIsLoading(true);
        try {
            let result: string;
            const profileToUse = profileData || profile;

            if (profileToUse && profileToUse.age > 0) {
                // Use personalized diet if we have profile data
                result = await getPersonalizedDiet({
                    age: profileToUse.age,
                    gender: profileToUse.gender,
                    weight: profileToUse.weight,
                    height: profileToUse.height,
                    conditions: profileToUse.conditions,
                    medications: profileToUse.medications,
                    allergies: profileToUse.allergies,
                    isSmoker: profileToUse.isSmoker,
                    drinksAlcohol: profileToUse.drinksAlcohol,
                    activityLevel: profileToUse.activityLevel,
                    weightGoal: profileToUse.weightGoal,
                    targetWeight: profileToUse.targetWeight,
                    timeframe: profileToUse.timeframe,
                    mealsPerDay: profileToUse.mealsPerDay,
                    dietaryRestrictions: profileToUse.dietaryRestrictions,
                    foodPreferences: profileToUse.foodPreferences
                }, language);
            } else {
                // Fall back to generic diet tips
                result = await getDigestiveHealthDiet(language);
            }
            setDietPlanResult(result);
        } catch (error) {
            console.error('Error loading diet info:', error);
            setDietPlanResult(getErrorMessage(error, language));
        }
        setIsLoading(false);
    }, [dietPlanResult, language, profile]);

    const handleDietProfileSaved = useCallback((savedProfile: HealthProfile) => {
        setProfile(savedProfile);
        setDietPlanResult(''); // Clear previous diet info
        handleLoadDiet(savedProfile);  // Load personalized diet
    }, [handleLoadDiet]);

    const addItem = useCallback((type: 'conditions' | 'medications' | 'allergies', value: string) => {
        if (!value.trim()) return;
        setProfile(prev => ({
            ...prev,
            [type]: [...prev[type], value.trim()]
        }));
        if (type === 'conditions') setNewCondition('');
        if (type === 'medications') setNewMedication('');
        if (type === 'allergies') setNewAllergy('');
    }, []);

    const removeItem = useCallback((type: 'conditions' | 'medications' | 'allergies', index: number) => {
        setProfile(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    }, []);

    const getRiskBadge = useCallback((urgency: string) => {
        const badges: Record<string, { class: string; label: string }> = {
            low: { class: 'low', label: t('lowRisk', language) },
            medium: { class: 'medium', label: t('mediumRisk', language) },
            high: { class: 'high', label: t('highRisk', language) },
            emergency: { class: 'emergency', label: t('emergency', language) }
        };
        return badges[urgency] || badges.medium;
    }, [language]);

    return (
        <div className="module-container animate-fadeInUp">
            <div className="module-header">
                <h1 className="module-title-large" style={{ color: 'var(--healthpro-primary)' }}>
                    🩺 {t('healthproTitle', language)}
                </h1>
                <p className="module-subtitle">{t('healthproDesc', language)}</p>
            </div>

            <div className="tabs" role="tablist" aria-label={t('healthproTitle', language)}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Symptom Analysis Tab */}
            {activeTab === 'symptoms' && (
                <div
                    id="panel-symptoms"
                    role="tabpanel"
                    className="glass-card animate-fadeIn"
                >
                    <h3 className="section-title">{t('symptomAnalysis', language)}</h3>

                    <div className="form-group">
                        <label className="form-label" htmlFor="symptom-input">
                            {t('describeSymptoms', language)}
                        </label>
                        <textarea
                            id="symptom-input"
                            value={symptomInput}
                            onChange={(e) => setSymptomInput(e.target.value)}
                            className="form-input"
                            rows={4}
                            placeholder={t('describeSymptoms', language)}
                            aria-describedby="symptom-hint"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="severity-select">
                                {t('severity', language)}
                            </label>
                            <select
                                id="severity-select"
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                                className="form-select"
                            >
                                <option value="mild">{t('mild', language)}</option>
                                <option value="moderate">{t('moderate', language)}</option>
                                <option value="severe">{t('severe', language)}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="duration-input">
                                {t('duration', language)}
                            </label>
                            <input
                                id="duration-input"
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="form-input"
                                placeholder={t('durationPlaceholder', language)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="location-input">
                                {t('bodyLocation', language)}
                            </label>
                            <input
                                id="location-input"
                                type="text"
                                value={bodyLocation}
                                onChange={(e) => setBodyLocation(e.target.value)}
                                className="form-input"
                                placeholder={t('locationPlaceholder', language)}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSymptomAnalysis}
                        disabled={!symptomInput.trim() || isLoading}
                        aria-busy={isLoading}
                        style={{ background: 'var(--healthpro-primary)', marginBottom: '1.5rem' }}
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

                    {/* Diagnosis Results */}
                    {diagnosisResults.length > 0 && (
                        <div style={{ display: 'grid', gap: '1rem' }} role="region" aria-label={t('symptomAnalysis', language)}>
                            {diagnosisResults.map((result, idx) => {
                                const badge = getRiskBadge(result.urgency);
                                return (
                                    <div key={idx} className="diagnosis-card">
                                        <div className="diagnosis-header">
                                            <div>
                                                <h4 className="diagnosis-name">{result.condition}</h4>
                                                <span className="confidence-score">
                                                    {t('confidence', language)}: {result.confidence}%
                                                </span>
                                            </div>
                                            <span className={`risk-badge ${badge.class}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="diagnosis-body">
                                            <p style={{ marginBottom: '1rem' }}>{result.description}</p>

                                            {result.recommendedActions.length > 0 && (
                                                <div className="diagnosis-section">
                                                    <h4>{t('recommendedActions', language)}</h4>
                                                    <ul>
                                                        {result.recommendedActions.map((action, i) => (
                                                            <li key={i}>{action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {result.warningsSigns.length > 0 && (
                                                <div className="diagnosis-section">
                                                    <h4 style={{ color: 'var(--accent-red)' }}>
                                                        {t('warningSigns', language)}
                                                    </h4>
                                                    <ul>
                                                        {result.warningsSigns.map((sign, i) => (
                                                            <li key={i} style={{ color: 'var(--accent-red)' }}>{sign}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Second Opinion Tab */}
            {activeTab === 'secondopinion' && (
                <div id="panel-secondopinion" role="tabpanel" className="glass-card animate-fadeIn">
                    <h3 className="section-title">{t('secondOpinion', language)}</h3>

                    <div className="form-group">
                        <label className="form-label" htmlFor="diagnosis-input">
                            {t('currentDiagnosis', language)}
                        </label>
                        <input
                            id="diagnosis-input"
                            type="text"
                            value={existingDiagnosis}
                            onChange={(e) => setExistingDiagnosis(e.target.value)}
                            className="form-input"
                            placeholder={t('existingDiagnosis', language)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="current-symptoms">
                            {t('yourSymptoms', language)}
                        </label>
                        <textarea
                            id="current-symptoms"
                            value={currentSymptoms}
                            onChange={(e) => setCurrentSymptoms(e.target.value)}
                            className="form-input"
                            rows={3}
                            placeholder={t('describeSymptoms', language)}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSecondOpinion}
                        disabled={!existingDiagnosis.trim() || isLoading}
                        aria-busy={isLoading}
                        style={{ background: 'var(--healthpro-primary)', marginBottom: '1.5rem' }}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
                                <span aria-live="polite">{t('loading', language)}</span>
                            </>
                        ) : (
                            <>🩺 {t('getSecondOpinion', language)}</>
                        )}
                    </button>

                    {secondOpinionResult && (
                        <div
                            className="result-box animate-fadeInUp"
                            role="region"
                            aria-label={t('secondOpinion', language)}
                            style={{
                                padding: '1.5rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                borderLeft: '4px solid var(--healthpro-primary)'
                            }}
                        >
                            <div dangerouslySetInnerHTML={createSafeHtml(secondOpinionResult, 'var(--healthpro-secondary)')} />
                        </div>
                    )}
                </div>
            )}

            {/* Diet Plan Tab - Comprehensive with Profile Form */}
            {activeTab === 'diet' && (
                <div id="panel-diet" role="tabpanel" className="glass-card animate-fadeIn">
                    <HealthProfileForm
                        language={language}
                        onProfileSaved={handleDietProfileSaved}
                        autoExpand={profile.age <= 0}
                    />

                    {isLoading ? (
                        <div className="empty-state" role="status" aria-live="polite">
                            <div className="loading-spinner" style={{ width: 40, height: 40 }} aria-hidden="true" />
                            <p style={{ marginTop: '1rem' }}>{t('loading', language)}</p>
                        </div>
                    ) : dietPlanResult ? (
                        <DietTipsView content={dietPlanResult} language={language} />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🥗</div>
                            <p className="empty-state-text">
                                {language === 'te'
                                    ? 'వ్యక్తిగత ఆహార ప్రణాళిక కోసం మీ ప్రొఫైల్‌ను సేవ్ చేయండి'
                                    : 'Save your profile to get a personalized diet plan'
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Health Profile Tab */}
            {activeTab === 'profile' && (
                <div id="panel-profile" role="tabpanel" className="glass-card animate-fadeIn">
                    <h3 className="section-title">{t('healthProfile', language)}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="age-input">{t('age', language)}</label>
                            <input
                                id="age-input"
                                type="number"
                                value={profile.age || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                                className="form-input"
                                min={1}
                                max={120}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="gender-select">{t('gender', language)}</label>
                            <select
                                id="gender-select"
                                value={profile.gender}
                                onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                                className="form-select"
                            >
                                <option value="">{t('select', language)}</option>
                                <option value="male">{t('male', language)}</option>
                                <option value="female">{t('female', language)}</option>
                                <option value="other">{t('other', language)}</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="form-group">
                        <label className="form-label">{t('conditions', language)}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                                className="form-input"
                                placeholder={t('addCondition', language)}
                                onKeyPress={(e) => e.key === 'Enter' && addItem('conditions', newCondition)}
                                aria-label={t('addCondition', language)}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={() => addItem('conditions', newCondition)}
                                aria-label={t('addCondition', language)}
                            >
                                +
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {profile.conditions.map((cond, idx) => (
                                <span key={idx} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {cond}
                                    <button
                                        onClick={() => removeItem('conditions', idx)}
                                        aria-label={`Remove ${cond}`}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-red)',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="form-group">
                        <label className="form-label">{t('medications', language)}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={newMedication}
                                onChange={(e) => setNewMedication(e.target.value)}
                                className="form-input"
                                placeholder={t('addMedication', language)}
                                onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication)}
                                aria-label={t('addMedication', language)}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={() => addItem('medications', newMedication)}
                                aria-label={t('addMedication', language)}
                            >
                                +
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {profile.medications.map((med, idx) => (
                                <span key={idx} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {med}
                                    <button
                                        onClick={() => removeItem('medications', idx)}
                                        aria-label={`Remove ${med}`}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-red)',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="form-group">
                        <label className="form-label">{t('allergies', language)}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                className="form-input"
                                placeholder={t('addAllergy', language)}
                                onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
                                aria-label={t('addAllergy', language)}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={() => addItem('allergies', newAllergy)}
                                aria-label={t('addAllergy', language)}
                            >
                                +
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {profile.allergies.map((allergy, idx) => (
                                <span key={idx} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {allergy}
                                    <button
                                        onClick={() => removeItem('allergies', idx)}
                                        aria-label={`Remove ${allergy}`}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-red)',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        style={{ background: 'var(--healthpro-primary)' }}
                    >
                        💾 {t('save', language)}
                    </button>

                    {profileSaved && (
                        <p
                            style={{ color: 'var(--accent-emerald)', marginTop: '1rem' }}
                            role="status"
                            aria-live="polite"
                        >
                            ✓ {t('profileSaved', language)}
                        </p>
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

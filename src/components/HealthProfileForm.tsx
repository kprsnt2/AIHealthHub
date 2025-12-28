import { useState, useCallback, useEffect } from 'react';
import type { Language, HealthProfile } from '../types';
import { getHealthProfile, saveHealthProfile, generateId } from '../services/storageService';
import './HealthProfileForm.css';

interface HealthProfileFormProps {
    language: Language;
    onProfileSaved: (profile: HealthProfile) => void;
    autoExpand?: boolean;
}

// Common conditions for quick selection
const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'COPD',
    'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'Arthritis', 'Depression',
    'Anxiety', 'Migraine', 'Epilepsy', 'Cancer', 'IBS', 'GERD', 'Celiac Disease'];

// Dietary restrictions
const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Low-Sodium', 'Halal', 'Kosher', 'Keto', 'Paleo'];

// Food preferences
const FOOD_PREFERENCES = ['Indian', 'Mediterranean', 'Asian', 'Mexican', 'High Protein',
    'Low Carb', 'Home Cooking', 'Quick Meals', 'Organic', 'Whole Foods'];

export default function HealthProfileForm({
    language,
    onProfileSaved,
    autoExpand = true
}: HealthProfileFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [profile, setProfile] = useState<Partial<HealthProfile>>({
        age: undefined,
        gender: '',
        weight: undefined,
        height: undefined,
        conditions: [],
        medications: [],
        allergies: [],
        isSmoker: false,
        drinksAlcohol: false,
        activityLevel: 'light',
        weightGoal: 'maintain',
        targetWeight: undefined,
        timeframe: '3_months',
        mealsPerDay: 3,
        dietaryRestrictions: [],
        foodPreferences: []
    });
    const [newMedication, setNewMedication] = useState('');
    const [newAllergy, setNewAllergy] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);

    // Load existing profile on mount
    useEffect(() => {
        const existingProfile = getHealthProfile();
        if (existingProfile) {
            setProfile(existingProfile);
            setHasExistingProfile(true);
            setIsExpanded(false);
        } else if (autoExpand) {
            setIsExpanded(true);
        }
    }, [autoExpand]);

    const handleInputChange = useCallback((field: keyof HealthProfile, value: string | number | boolean) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    }, []);

    const toggleArrayItem = useCallback((field: 'conditions' | 'dietaryRestrictions' | 'foodPreferences', item: string) => {
        setProfile(prev => {
            const currentArray = (prev[field] as string[]) || [];
            const newArray = currentArray.includes(item)
                ? currentArray.filter(i => i !== item)
                : [...currentArray, item];
            return { ...prev, [field]: newArray };
        });
    }, []);

    const addMedication = useCallback(() => {
        if (newMedication.trim()) {
            setProfile(prev => ({
                ...prev,
                medications: [...(prev.medications || []), newMedication.trim()]
            }));
            setNewMedication('');
        }
    }, [newMedication]);

    const removeMedication = useCallback((med: string) => {
        setProfile(prev => ({
            ...prev,
            medications: (prev.medications || []).filter(m => m !== med)
        }));
    }, []);

    const addAllergy = useCallback(() => {
        if (newAllergy.trim()) {
            setProfile(prev => ({
                ...prev,
                allergies: [...(prev.allergies || []), newAllergy.trim()]
            }));
            setNewAllergy('');
        }
    }, [newAllergy]);

    const removeAllergy = useCallback((allergy: string) => {
        setProfile(prev => ({
            ...prev,
            allergies: (prev.allergies || []).filter(a => a !== allergy)
        }));
    }, []);

    const handleSave = useCallback(() => {
        const fullProfile: HealthProfile = {
            id: profile.id || generateId(),
            age: profile.age || 0,
            gender: profile.gender || '',
            weight: profile.weight,
            height: profile.height,
            conditions: profile.conditions || [],
            medications: profile.medications || [],
            allergies: profile.allergies || [],
            isSmoker: profile.isSmoker,
            drinksAlcohol: profile.drinksAlcohol,
            activityLevel: profile.activityLevel,
            weightGoal: profile.weightGoal,
            targetWeight: profile.targetWeight,
            timeframe: profile.timeframe,
            mealsPerDay: profile.mealsPerDay,
            dietaryRestrictions: profile.dietaryRestrictions || [],
            foodPreferences: profile.foodPreferences || [],
            lastUpdated: new Date()
        };

        saveHealthProfile(fullProfile);
        setHasExistingProfile(true);
        setIsExpanded(false);
        onProfileSaved(fullProfile);
    }, [profile, onProfileSaved]);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const calculateBMI = useCallback(() => {
        if (profile.weight && profile.height) {
            const heightM = profile.height / 100;
            return (profile.weight / (heightM * heightM)).toFixed(1);
        }
        return null;
    }, [profile.weight, profile.height]);

    const bmi = calculateBMI();
    const t = (en: string, te: string) => language === 'te' ? te : en;

    return (
        <div className="health-profile-form">
            <div
                className="profile-header"
                onClick={toggleExpand}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleExpand()}
            >
                <div className="profile-header-left">
                    <div className="profile-icon">👤</div>
                    <div>
                        <h3 className="profile-header-title">
                            {t('Health Profile', 'ఆరోగ్య ప్రొఫైల్')}
                        </h3>
                        <p className="profile-header-subtitle">
                            {hasExistingProfile
                                ? t('Create your profile for personalized analysis', 'వ్యక్తిగత విశ్లేషణ కోసం మీ ప్రొఫైల్ సృష్టించండి')
                                : t('Complete for personalized diet tips', 'వ్యక్తిగత ఆహార చిట్కాల కోసం పూర్తి చేయండి')
                            }
                        </p>
                    </div>
                </div>
                <span className={`profile-toggle-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                </span>
            </div>

            {/* Profile Summary when collapsed */}
            {!isExpanded && hasExistingProfile && (
                <div className="profile-stats">
                    {profile.age && (
                        <div className="stat-card">
                            <div className="stat-value">{profile.age}</div>
                            <div className="stat-label">{t('Age', 'వయస్సు')}</div>
                        </div>
                    )}
                    {profile.weight && (
                        <div className="stat-card">
                            <div className="stat-value">{profile.weight}</div>
                            <div className="stat-label">{t('Weight (kg)', 'బరువు (kg)')}</div>
                        </div>
                    )}
                    {profile.height && (
                        <div className="stat-card">
                            <div className="stat-value">{profile.height}</div>
                            <div className="stat-label">{t('Height (cm)', 'ఎత్తు (cm)')}</div>
                        </div>
                    )}
                    {bmi && (
                        <div className="stat-card">
                            <div className="stat-value">{bmi}</div>
                            <div className="stat-label">BMI</div>
                        </div>
                    )}
                </div>
            )}

            {/* Expandable Form */}
            {isExpanded && (
                <div className="profile-form-content">
                    {/* Basic Info Section */}
                    <div className="profile-form-grid">
                        <div className="form-group">
                            <label className="form-label">{t('Age', 'వయస్సు')}</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="30"
                                value={profile.age || ''}
                                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                                min={1}
                                max={120}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Gender', 'లింగం')}</label>
                            <select
                                className="form-select"
                                value={profile.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <option value="">{t('Select', 'ఎంచుకోండి')}</option>
                                <option value="male">{t('Male', 'పురుషుడు')}</option>
                                <option value="female">{t('Female', 'స్త్రీ')}</option>
                                <option value="other">{t('Prefer not to say', 'చెప్పడానికి ఇష్టపడటం లేదు')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Weight (kg)', 'బరువు (kg)')}</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="70"
                                value={profile.weight || ''}
                                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                min={20}
                                max={300}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Height (cm)', 'ఎత్తు (cm)')}</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="170"
                                value={profile.height || ''}
                                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                                min={50}
                                max={250}
                            />
                        </div>
                    </div>

                    {/* Existing Conditions */}
                    <div className="form-section">
                        <label className="form-label section-label">♡ {t('Existing Conditions', 'ఉన్న పరిస్థితులు')}</label>
                        <div className="pill-container">
                            {CONDITIONS.map(condition => (
                                <button
                                    key={condition}
                                    type="button"
                                    className={`pill ${(profile.conditions || []).includes(condition) ? 'active' : ''}`}
                                    onClick={() => toggleArrayItem('conditions', condition)}
                                >
                                    {condition}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Medications */}
                    <div className="form-section">
                        <label className="form-label section-label">⚕ {t('Current Medications', 'ప్రస్తుత మందులు')}</label>
                        <div className="add-item-row">
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('Add medication...', 'మందు జోడించు...')}
                                value={newMedication}
                                onChange={(e) => setNewMedication(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                            />
                            <button type="button" className="btn-add" onClick={addMedication}>
                                {t('Add', 'జోడించు')}
                            </button>
                        </div>
                        {(profile.medications || []).length > 0 && (
                            <div className="added-items">
                                {(profile.medications || []).map((med, idx) => (
                                    <span key={idx} className="added-item">
                                        {med}
                                        <button onClick={() => removeMedication(med)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Known Allergies */}
                    <div className="form-section">
                        <label className="form-label section-label">△ {t('Known Allergies', 'తెలిసిన అలర్జీలు')}</label>
                        <div className="add-item-row">
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('Add allergy...', 'అలర్జీ జోడించు...')}
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                            />
                            <button type="button" className="btn-add" onClick={addAllergy}>
                                {t('Add', 'జోడించు')}
                            </button>
                        </div>
                        {(profile.allergies || []).length > 0 && (
                            <div className="added-items">
                                {(profile.allergies || []).map((allergy, idx) => (
                                    <span key={idx} className="added-item">
                                        {allergy}
                                        <button onClick={() => removeAllergy(allergy)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lifestyle */}
                    <div className="form-section">
                        <label className="form-label section-label">⚡ {t('Lifestyle', 'జీవనశైలి')}</label>
                        <div className="lifestyle-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={profile.isSmoker || false}
                                    onChange={(e) => handleInputChange('isSmoker', e.target.checked)}
                                />
                                {t('Smoker', 'ధూమపానం')}
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={profile.drinksAlcohol || false}
                                    onChange={(e) => handleInputChange('drinksAlcohol', e.target.checked)}
                                />
                                {t('Drinks Alcohol', 'మద్యం సేవిస్తారు')}
                            </label>
                            <select
                                className="form-select activity-select"
                                value={profile.activityLevel || 'light'}
                                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                            >
                                <option value="sedentary">{t('Sedentary', 'నిశ్చలంగా')}</option>
                                <option value="light">{t('Light Activity', 'తేలిక కార్యకలాపం')}</option>
                                <option value="moderate">{t('Moderate', 'మధ్యస్థం')}</option>
                                <option value="active">{t('Active', 'చురుకైన')}</option>
                                <option value="very_active">{t('Very Active', 'చాలా చురుకైన')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Weight Goals */}
                    <div className="form-section">
                        <label className="form-label section-label">🎯 {t('Weight Goal', 'బరువు లక్ష్యం')}</label>
                        <div className="goal-buttons">
                            <button
                                type="button"
                                className={`goal-btn ${profile.weightGoal === 'lose' ? 'active lose' : ''}`}
                                onClick={() => handleInputChange('weightGoal', 'lose')}
                            >
                                <span className="goal-icon">📉</span>
                                {t('Lose Weight', 'బరువు తగ్గించు')}
                            </button>
                            <button
                                type="button"
                                className={`goal-btn ${profile.weightGoal === 'maintain' ? 'active maintain' : ''}`}
                                onClick={() => handleInputChange('weightGoal', 'maintain')}
                            >
                                <span className="goal-icon">➖</span>
                                {t('Maintain', 'నిర్వహించు')}
                            </button>
                            <button
                                type="button"
                                className={`goal-btn ${profile.weightGoal === 'gain' ? 'active gain' : ''}`}
                                onClick={() => handleInputChange('weightGoal', 'gain')}
                            >
                                <span className="goal-icon">📈</span>
                                {t('Gain Weight', 'బరువు పెంచు')}
                            </button>
                        </div>

                        <div className="profile-form-grid" style={{ marginTop: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">{t('Target Weight (kg)', 'లక్ష్య బరువు (kg)')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="65"
                                    value={profile.targetWeight || ''}
                                    onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Timeframe', 'సమయం')}</label>
                                <select
                                    className="form-select"
                                    value={profile.timeframe || '3_months'}
                                    onChange={(e) => handleInputChange('timeframe', e.target.value)}
                                >
                                    <option value="1_month">1 {t('Month', 'నెల')}</option>
                                    <option value="3_months">3 {t('Months', 'నెలలు')}</option>
                                    <option value="6_months">6 {t('Months', 'నెలలు')}</option>
                                    <option value="1_year">1 {t('Year', 'సంవత్సరం')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Meals per Day */}
                    <div className="form-section">
                        <label className="form-label section-label">🍽️ {t('Meals per Day', 'రోజుకు భోజనాలు')}</label>
                        <div className="meals-buttons">
                            {[2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    className={`meal-btn ${profile.mealsPerDay === num ? 'active' : ''}`}
                                    onClick={() => handleInputChange('mealsPerDay', num)}
                                >
                                    {num} {t('meals', 'భోజనాలు')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div className="form-section">
                        <label className="form-label section-label">🥗 {t('Dietary Restrictions', 'ఆహార పరిమితులు')}</label>
                        <div className="pill-container">
                            {DIETARY_RESTRICTIONS.map(restriction => (
                                <button
                                    key={restriction}
                                    type="button"
                                    className={`pill dietary ${(profile.dietaryRestrictions || []).includes(restriction) ? 'active' : ''}`}
                                    onClick={() => toggleArrayItem('dietaryRestrictions', restriction)}
                                >
                                    {restriction}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Food Preferences */}
                    <div className="form-section">
                        <label className="form-label section-label">❤️ {t('Food Preferences', 'ఆహార ప్రాధాన్యతలు')}</label>
                        <div className="pill-container">
                            {FOOD_PREFERENCES.map(pref => (
                                <button
                                    key={pref}
                                    type="button"
                                    className={`pill preferences ${(profile.foodPreferences || []).includes(pref) ? 'active' : ''}`}
                                    onClick={() => toggleArrayItem('foodPreferences', pref)}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-form-actions">
                        <button
                            className="btn btn-primary btn-save"
                            onClick={handleSave}
                            disabled={!profile.age}
                        >
                            📄 {t('Save Profile', 'ప్రొఫైల్ సేవ్ చేయి')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useCallback, useEffect } from 'react';
import type { Language, HealthProfile } from '../types';
import { getHealthProfile, saveHealthProfile, generateId } from '../services/storageService';
import './HealthProfileForm.css';

interface HealthProfileFormProps {
    language: Language;
    onProfileSaved: (profile: HealthProfile) => void;
    autoExpand?: boolean;
}

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
        allergies: []
    });
    const [conditionsText, setConditionsText] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);

    // Load existing profile on mount
    useEffect(() => {
        const existingProfile = getHealthProfile();
        if (existingProfile) {
            setProfile(existingProfile);
            setConditionsText(existingProfile.conditions?.join(', ') || '');
            setHasExistingProfile(true);
            setIsExpanded(false); // Collapse if profile exists
        } else if (autoExpand) {
            setIsExpanded(true); // Auto-expand if no profile
        }
    }, [autoExpand]);

    const handleInputChange = useCallback((field: keyof HealthProfile, value: string | number) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleConditionsChange = useCallback((text: string) => {
        setConditionsText(text);
        const conditions = text.split(',').map(c => c.trim()).filter(c => c.length > 0);
        setProfile(prev => ({ ...prev, conditions }));
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
                            {language === 'te' ? 'మీ ఆరోగ్య ప్రొఫైల్' : 'Your Health Profile'}
                        </h3>
                        <p className="profile-header-subtitle">
                            {hasExistingProfile
                                ? (language === 'te' ? 'సవరించడానికి క్లిక్ చేయండి' : 'Click to edit')
                                : (language === 'te' ? 'వ్యక్తిగత ఆహార చిట్కాల కోసం పూర్తి చేయండి' : 'Complete for personalized diet tips')
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
                            <div className="stat-label">{language === 'te' ? 'వయస్సు' : 'Age'}</div>
                        </div>
                    )}
                    {profile.weight && (
                        <div className="stat-card">
                            <div className="stat-value">{profile.weight}</div>
                            <div className="stat-label">{language === 'te' ? 'బరువు (kg)' : 'Weight (kg)'}</div>
                        </div>
                    )}
                    {profile.height && (
                        <div className="stat-card">
                            <div className="stat-value">{profile.height}</div>
                            <div className="stat-label">{language === 'te' ? 'ఎత్తు (cm)' : 'Height (cm)'}</div>
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
                    <div className="profile-form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'te' ? 'వయస్సు' : 'Age'} *
                            </label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder={language === 'te' ? 'మీ వయస్సు' : 'Your age'}
                                value={profile.age || ''}
                                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                                min={1}
                                max={120}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {language === 'te' ? 'లింగం' : 'Gender'}
                            </label>
                            <select
                                className="form-select"
                                value={profile.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <option value="">{language === 'te' ? 'ఎంచుకోండి' : 'Select'}</option>
                                <option value="male">{language === 'te' ? 'పురుషుడు' : 'Male'}</option>
                                <option value="female">{language === 'te' ? 'స్త్రీ' : 'Female'}</option>
                                <option value="other">{language === 'te' ? 'ఇతర' : 'Other'}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {language === 'te' ? 'బరువు' : 'Weight'} <span className="optional">({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})</span>
                            </label>
                            <div className="form-input-group">
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="70"
                                    value={profile.weight || ''}
                                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                    min={20}
                                    max={300}
                                />
                                <span className="form-input-suffix">kg</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {language === 'te' ? 'ఎత్తు' : 'Height'} <span className="optional">({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})</span>
                            </label>
                            <div className="form-input-group">
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="170"
                                    value={profile.height || ''}
                                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                                    min={50}
                                    max={250}
                                />
                                <span className="form-input-suffix">cm</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">
                            {language === 'te' ? 'ఆరోగ్య పరిస్థితులు' : 'Health Conditions'} <span className="optional">({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})</span>
                        </label>
                        <textarea
                            className="form-textarea"
                            placeholder={language === 'te'
                                ? 'ఉదా: మధుమేహం, అధిక రక్తపోటు, IBS (కామాతో వేరు చేయండి)'
                                : 'e.g., Diabetes, High BP, IBS (separate with commas)'
                            }
                            value={conditionsText}
                            onChange={(e) => handleConditionsChange(e.target.value)}
                        />
                        <p className="form-hint">
                            {language === 'te'
                                ? 'ఇది మీ ఆహార సిఫార్సులను వ్యక్తిగతీకరించడంలో సహాయపడుతుంది'
                                : 'This helps personalize your diet recommendations'
                            }
                        </p>
                    </div>

                    <div className="profile-form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => setIsExpanded(false)}
                        >
                            {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!profile.age}
                        >
                            {language === 'te' ? 'ప్రొఫైల్ సేవ్ చేయి' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

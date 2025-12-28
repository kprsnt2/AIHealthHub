import { useState, useCallback, useMemo } from 'react';
import type { Language, DrugInfo } from '../../types';
import { t } from '../../i18n/translations';
import { analyzeDrug } from '../../services/geminiService';
import { saveDrugSearch, getDrugHistory } from '../../services/storageService';

interface MolecuLearnModuleProps {
    language: Language;
}

export default function MolecuLearnModule({ language }: MolecuLearnModuleProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchHistory] = useState<string[]>(getDrugHistory());

    const handleSearch = useCallback(async (drugName?: string) => {
        const query = drugName || searchQuery.trim();
        if (!query) return;

        setIsLoading(true);
        setError('');
        setDrugInfo(null);

        try {
            const result = await analyzeDrug(query, language);
            setDrugInfo(result);
            saveDrugSearch(query);
        } catch (err) {
            console.error('Error analyzing drug:', err);
            setError(t('drugAnalysisError', language));
        }

        setIsLoading(false);
    }, [searchQuery, language]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    }, [handleSearch]);

    const handleHistoryClick = useCallback((drug: string) => {
        setSearchQuery(drug);
        handleSearch(drug);
    }, [handleSearch]);

    const getSafetyColor = useMemo(() => (score: number): string => {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }, []);

    const getSafetyTextColor = useCallback((score: number): string => {
        if (score >= 70) return 'var(--accent-emerald)';
        if (score >= 40) return 'var(--accent-amber)';
        return 'var(--accent-red)';
    }, []);

    return (
        <div className="module-container animate-fadeInUp">
            <div className="module-header">
                <h1 className="module-title-large" style={{ color: 'var(--moleculearn-primary)' }}>
                    💊 {t('moleculearnTitle', language)}
                </h1>
                <p className="module-subtitle">{t('moleculearnDesc', language)}</p>
            </div>

            {/* Search Section */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <form onSubmit={handleFormSubmit} className="search-form" role="search">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder={t('searchDrug', language)}
                            className="form-input"
                            style={{ flex: 1, minWidth: '200px' }}
                            aria-label={t('searchDrug', language)}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!searchQuery.trim() || isLoading}
                            aria-busy={isLoading}
                            style={{ background: 'var(--moleculearn-primary)' }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
                                    <span>{t('loading', language)}</span>
                                </>
                            ) : (
                                <>🔍 {t('search', language)}</>
                            )}
                        </button>
                    </div>
                </form>

                {/* Recent Searches */}
                {searchHistory.length > 0 && !drugInfo && (
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            {t('recentSearches', language)}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {searchHistory.slice(0, 5).map((drug, idx) => (
                                <button
                                    key={idx}
                                    className="pill"
                                    onClick={() => handleHistoryClick(drug)}
                                    style={{ cursor: 'pointer' }}
                                    aria-label={`Search for ${drug}`}
                                >
                                    {drug}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div
                    className="glass-card"
                    style={{ borderLeft: '4px solid var(--accent-red)', marginBottom: '1.5rem' }}
                    role="alert"
                >
                    <p style={{ color: 'var(--accent-red)' }}>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="glass-card">
                    <div className="empty-state" role="status" aria-live="polite">
                        <div className="loading-spinner" style={{ width: 40, height: 40 }} aria-hidden="true" />
                        <p style={{ marginTop: '1rem' }}>{t('loading', language)}</p>
                    </div>
                </div>
            )}

            {/* Drug Results */}
            {drugInfo && !isLoading && (
                <div className="drug-result" role="region" aria-label={`${drugInfo.name} information`}>
                    {/* Drug Header */}
                    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                        <div className="drug-header">
                            <div>
                                <h2 className="drug-name">{drugInfo.name}</h2>
                                <p className="drug-generic">{drugInfo.genericName} • {drugInfo.category}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    {t('safetyScore', language)}
                                </p>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: getSafetyTextColor(drugInfo.safetyScore)
                                }}>
                                    {drugInfo.safetyScore}/100
                                </div>
                            </div>
                        </div>
                        <div className="safety-meter" style={{ marginTop: '1rem' }} role="progressbar" aria-valuenow={drugInfo.safetyScore} aria-valuemin={0} aria-valuemax={100}>
                            <div
                                className={`safety-fill ${getSafetyColor(drugInfo.safetyScore)}`}
                                style={{ width: `${drugInfo.safetyScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Uses & Side Effects */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="glass-card">
                            <h3 className="section-title" style={{ color: 'var(--accent-emerald)' }}>
                                ✓ {t('uses', language)}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }} role="list">
                                {drugInfo.uses.map((use, idx) => (
                                    <li key={idx} style={{
                                        padding: '0.5rem 0',
                                        borderBottom: idx < drugInfo.uses.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                                    }}>
                                        {use}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="glass-card">
                            <h3 className="section-title" style={{ color: 'var(--accent-amber)' }}>
                                ⚠️ {t('sideEffects', language)}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }} role="list">
                                {drugInfo.sideEffects.map((effect, idx) => (
                                    <li key={idx} style={{
                                        padding: '0.5rem 0',
                                        borderBottom: idx < drugInfo.sideEffects.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                                    }}>
                                        {effect}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Warnings */}
                    {drugInfo.warnings.length > 0 && (
                        <div className="glass-card" style={{
                            marginBottom: '1.5rem',
                            borderLeft: '4px solid var(--accent-red)'
                        }}>
                            <h3 className="section-title" style={{ color: 'var(--accent-red)' }}>
                                🚨 {t('warnings', language)}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }} role="list">
                                {drugInfo.warnings.map((warning, idx) => (
                                    <li key={idx} style={{ padding: '0.5rem 0' }}>• {warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Alternatives */}
                    {drugInfo.alternatives.length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                            <h3 className="section-title" style={{ color: 'var(--moleculearn-primary)' }}>
                                💊 {t('alternatives', language)}
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {drugInfo.alternatives.map((alt, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div>
                                                <strong>{alt.name}</strong>
                                                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                                    ({alt.genericName})
                                                </span>
                                            </div>
                                            <span style={{
                                                color: alt.safetyScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                                                fontWeight: 600
                                            }}>
                                                {alt.safetyScore}/100
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {alt.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Natural Alternatives */}
                    {drugInfo.naturalAlternatives.length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                            <h3 className="section-title" style={{ color: 'var(--accent-emerald)' }}>
                                🌿 {t('naturalRemedies', language)}
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {drugInfo.naturalAlternatives.map((nat, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: 'var(--accent-emerald)' }}>{nat.name}</strong>
                                            <span className="pill" style={{
                                                background: 'var(--accent-emerald)',
                                                color: 'white',
                                                border: 'none'
                                            }}>
                                                {nat.effectiveness}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {nat.description}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            📚 {t('evidence', language)} {nat.evidence}
                                        </p>
                                        {nat.precautions.length > 0 && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
                                                ⚠️ {nat.precautions.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!drugInfo && !isLoading && !error && (
                <div className="glass-card">
                    <div className="empty-state">
                        <div className="empty-state-icon" aria-hidden="true">💊</div>
                        <p className="empty-state-text">{t('startSearch', language)}</p>
                    </div>
                </div>
            )}

            <div className="disclaimer" role="note">
                <span className="disclaimer-icon" aria-hidden="true">⚠️</span>
                <span>{t('disclaimer', language)}</span>
            </div>
        </div>
    );
}

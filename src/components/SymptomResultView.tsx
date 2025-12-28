import { useMemo } from 'react';
import type { Language } from '../types';
import './SymptomResultView.css';

interface SymptomResultViewProps {
    content: string;
    language: Language;
}

interface ResultSection {
    type: 'conditions' | 'actions' | 'warnings' | 'explanation';
    icon: string;
    title: string;
    items: string[];
}

// Convert markdown bold (**text**) to HTML
function formatMarkdownText(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

interface SeverityInfo {
    level: 'mild' | 'moderate' | 'severe';
    icon: string;
    title: string;
    description: string;
}

// Detect severity from content
function detectSeverity(content: string, language: Language): SeverityInfo {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('severe') || lowerContent.includes('high') ||
        lowerContent.includes('emergency') || lowerContent.includes('immediate') ||
        lowerContent.includes('urgent')) {
        return {
            level: 'severe',
            icon: '🚨',
            title: language === 'te' ? 'తీవ్రమైన తీవ్రత' : 'High Severity',
            description: language === 'te'
                ? 'దయచేసి వెంటనే వైద్యుడిని సంప్రదించండి'
                : 'Please consult a doctor immediately'
        };
    } else if (lowerContent.includes('moderate') || lowerContent.includes('medium')) {
        return {
            level: 'moderate',
            icon: '⚠️',
            title: language === 'te' ? 'మధ్యస్థ తీవ్రత' : 'Moderate Severity',
            description: language === 'te'
                ? 'వైద్య సలహా తీసుకోవడం మంచిది'
                : 'Medical consultation is recommended'
        };
    }

    return {
        level: 'mild',
        icon: '✅',
        title: language === 'te' ? 'తేలికపాటి తీవ్రత' : 'Mild Severity',
        description: language === 'te'
            ? 'లక్షణాలు కొనసాగితే వైద్యుడిని సంప్రదించండి'
            : 'Monitor symptoms and consult if they persist'
    };
}

// Parse content into sections
function parseSymptomResult(content: string, language: Language): ResultSection[] {
    const sections: ResultSection[] = [];

    const sectionConfig = [
        {
            type: 'conditions' as const,
            icon: '🏥',
            patterns: ['possible', 'condition', 'indicate', 'may suggest', 'could be'],
            titleEn: 'Possible Conditions',
            titleTe: 'సాధ్యమైన పరిస్థితులు'
        },
        {
            type: 'explanation' as const,
            icon: '📋',
            patterns: ['explanation', 'symptoms relate', 'because', 'how these'],
            titleEn: 'Understanding Your Symptoms',
            titleTe: 'మీ లక్షణాలను అర్థం చేసుకోవడం'
        },
        {
            type: 'actions' as const,
            icon: '✅',
            patterns: ['recommend', 'next step', 'should', 'suggested', 'action'],
            titleEn: 'Recommended Actions',
            titleTe: 'సిఫార్సు చేసిన చర్యలు'
        },
        {
            type: 'warnings' as const,
            icon: '⚠️',
            patterns: ['warning', 'emergency', 'immediate', 'seek help', 'watch for'],
            titleEn: 'Warning Signs',
            titleTe: 'హెచ్చరిక సంకేతాలు'
        }
    ];

    const lines = content.split('\n');
    let currentSection: ResultSection | null = null;
    let currentItems: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Check if this is a header
        const isHeader = /^(#{1,3}|\d+[\.\)])\s/.test(trimmedLine) ||
            /^[A-Z][A-Z\s]+:?\s*$/.test(trimmedLine);

        if (isHeader) {
            if (currentSection && currentItems.length > 0) {
                currentSection.items = currentItems;
                sections.push(currentSection);
            }

            const lowerLine = trimmedLine.toLowerCase();
            const matchedConfig = sectionConfig.find(s =>
                s.patterns.some(p => lowerLine.includes(p))
            );

            if (matchedConfig) {
                currentSection = {
                    type: matchedConfig.type,
                    icon: matchedConfig.icon,
                    title: language === 'te' ? matchedConfig.titleTe : matchedConfig.titleEn,
                    items: []
                };
                currentItems = [];
            }
        } else if (currentSection) {
            const cleanedLine = trimmedLine
                .replace(/^[-•*]\s*/, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            if (cleanedLine.length > 5) {
                currentItems.push(cleanedLine);
            }
        } else {
            // No section yet, create explanation section
            if (!currentSection) {
                currentSection = {
                    type: 'explanation',
                    icon: '📋',
                    title: language === 'te' ? 'విశ్లేషణ' : 'Analysis',
                    items: []
                };
                currentItems = [];
            }
            const cleanedLine = trimmedLine.replace(/^[-•*]\s*/, '').trim();
            if (cleanedLine.length > 5) {
                currentItems.push(cleanedLine);
            }
        }
    }

    if (currentSection && currentItems.length > 0) {
        currentSection.items = currentItems;
        sections.push(currentSection);
    }

    // If no sections parsed, create one with all content
    if (sections.length === 0) {
        return [{
            type: 'explanation',
            icon: '📋',
            title: language === 'te' ? 'విశ్లేషణ ఫలితాలు' : 'Analysis Results',
            items: content.split('\n').filter(l => l.trim().length > 5)
        }];
    }

    // Deduplicate sections by type - merge items from sections of same type
    const deduplicatedSections: ResultSection[] = [];
    const sectionMap = new Map<string, ResultSection>();

    for (const section of sections) {
        const existing = sectionMap.get(section.type);
        if (existing) {
            // Merge items, avoiding duplicates
            const existingItems = new Set(existing.items);
            for (const item of section.items) {
                if (!existingItems.has(item)) {
                    existing.items.push(item);
                }
            }
        } else {
            const newSection = { ...section, items: [...section.items] };
            sectionMap.set(section.type, newSection);
            deduplicatedSections.push(newSection);
        }
    }

    return deduplicatedSections;
}

export default function SymptomResultView({ content, language }: SymptomResultViewProps) {
    const severity = useMemo(() => detectSeverity(content, language), [content, language]);
    const sections = useMemo(() => parseSymptomResult(content, language), [content, language]);

    if (!content) {
        return null;
    }

    return (
        <div className="symptom-result-container">
            {/* Severity Banner */}
            <div className={`severity-banner ${severity.level}`}>
                <div className="severity-icon">{severity.icon}</div>
                <div className="severity-text">
                    <h3>{severity.title}</h3>
                    <p>{severity.description}</p>
                </div>
            </div>

            {/* Result Sections */}
            {sections.map((section, index) => (
                <div key={index} className={`result-section ${section.type}`}>
                    <div className="result-section-header">
                        <div className="result-section-icon">{section.icon}</div>
                        <h3 className="result-section-title">{section.title}</h3>
                    </div>
                    <div className="result-section-content">
                        <ul>
                            {section.items.map((item, idx) => (
                                <li key={idx}>{formatMarkdownText(item)}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

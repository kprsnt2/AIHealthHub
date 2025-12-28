import { useMemo } from 'react';
import type { Language } from '../types';
import { t } from '../i18n/translations';
import './DietTipsView.css';

interface DietTipsViewProps {
    content: string;
    language: Language;
}

interface DietSection {
    type: 'recommended' | 'avoid' | 'moderation' | 'tips' | 'hydration' | 'habits';
    icon: string;
    title: string;
    items: string[];
}

// Parse AI response into structured sections
function parseDietContent(content: string, language: Language): DietSection[] {
    const sections: DietSection[] = [];

    // Define section patterns
    const sectionConfig = [
        {
            type: 'recommended' as const,
            icon: '✅',
            patterns: ['foods that support', 'foods to eat', 'recommended', 'good for digestion'],
            titleEn: 'Foods That Support Digestion',
            titleTe: 'జీర్ణక్రియకు సహాయపడే ఆహారాలు'
        },
        {
            type: 'avoid' as const,
            icon: '🚫',
            patterns: ['foods to limit', 'foods to avoid', 'avoid', 'limit'],
            titleEn: 'Foods to Avoid or Limit',
            titleTe: 'నివారించాల్సిన ఆహారాలు'
        },
        {
            type: 'moderation' as const,
            icon: '⚖️',
            patterns: ['moderation', 'occasionally', 'moderate'],
            titleEn: 'Foods in Moderation',
            titleTe: 'మితంగా తీసుకోవాల్సిన ఆహారాలు'
        },
        {
            type: 'tips' as const,
            icon: '💡',
            patterns: ['meal planning', 'planning tips', 'tips'],
            titleEn: 'Meal Planning Tips',
            titleTe: 'భోజన ప్రణాళిక చిట్కాలు'
        },
        {
            type: 'hydration' as const,
            icon: '💧',
            patterns: ['hydration', 'water', 'drink'],
            titleEn: 'Hydration Guidelines',
            titleTe: 'హైడ్రేషన్ మార్గదర్శకాలు'
        },
        {
            type: 'habits' as const,
            icon: '🍽️',
            patterns: ['eating habits', 'habits', 'meal timing', 'portion'],
            titleEn: 'Eating Habits for Better Digestion',
            titleTe: 'మెరుగైన జీర్ణక్రియ కోసం ఆహార అలవాట్లు'
        }
    ];

    // Split content by headers (lines that start with numbers or #)
    const lines = content.split('\n');
    let currentSection: DietSection | null = null;
    let currentItems: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Check if this is a header line
        const isHeader = /^(#{1,3}|\d+[\.\)])\s/.test(trimmedLine) ||
            /^[A-Z][A-Z\s]+:?\s*$/.test(trimmedLine) ||
            sectionConfig.some(s =>
                s.patterns.some(p => trimmedLine.toLowerCase().includes(p))
            );

        if (isHeader) {
            // Save previous section if exists
            if (currentSection && currentItems.length > 0) {
                currentSection.items = currentItems;
                sections.push(currentSection);
            }

            // Find matching section type
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
            // This is a content line - add to current section
            // Clean up the line (remove bullets, dashes, etc.)
            const cleanedLine = trimmedLine
                .replace(/^[-•*]\s*/, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            if (cleanedLine.length > 5) { // Ignore very short lines
                currentItems.push(cleanedLine);
            }
        }
    }

    // Save last section
    if (currentSection && currentItems.length > 0) {
        currentSection.items = currentItems;
        sections.push(currentSection);
    }

    // If parsing failed, return a single section with the raw content
    if (sections.length === 0) {
        return [{
            type: 'tips',
            icon: '📋',
            title: language === 'te' ? 'ఆహార మార్గదర్శకాలు' : 'Dietary Guidelines',
            items: content.split('\n').filter(l => l.trim().length > 5)
        }];
    }

    return sections;
}

export default function DietTipsView({ content, language }: DietTipsViewProps) {
    const sections = useMemo(() => parseDietContent(content, language), [content, language]);

    if (!content) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🥗</div>
                <p className="empty-state-text">{t('loading', language)}</p>
            </div>
        );
    }

    return (
        <div className="diet-tips-container">
            {sections.map((section, index) => (
                <div key={index} className={`diet-section ${section.type}`}>
                    <div className="diet-section-header">
                        <div className="diet-section-icon">{section.icon}</div>
                        <h3 className="diet-section-title">{section.title}</h3>
                    </div>
                    <div className="diet-section-content">
                        <ul>
                            {section.items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

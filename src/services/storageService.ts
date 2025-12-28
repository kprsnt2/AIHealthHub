/**
 * Storage Service with Encryption
 * Sensitive health data is encrypted using AES-256 before storage
 */

import type { HealthProfile, Consultation, Language } from '../types';
import { encryptData, decryptData } from '../utils/encryption';

const STORAGE_KEYS = {
    HEALTH_PROFILE: 'aihealth_profile',
    CONSULTATIONS: 'aihealth_consultations',
    LANGUAGE: 'aihealth_language',
    DRUG_HISTORY: 'aihealth_drug_history',
    ENCRYPTION_ENABLED: 'aihealth_encryption'
};

// Check if encryption is enabled (default: true for sensitive data)
function isEncryptionEnabled(): boolean {
    const setting = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_ENABLED);
    return setting !== 'false'; // Default to true
}

// Toggle encryption setting
export function setEncryptionEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ENCRYPTION_ENABLED, String(enabled));
}

// ============ Health Profile (ENCRYPTED) ============

export function saveHealthProfile(profile: HealthProfile): void {
    if (isEncryptionEnabled()) {
        const encrypted = encryptData(profile);
        localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, encrypted);
    } else {
        localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, JSON.stringify(profile));
    }
}

export function getHealthProfile(): HealthProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_PROFILE);
    if (!data) return null;

    try {
        let profile: HealthProfile | null;

        if (isEncryptionEnabled()) {
            profile = decryptData<HealthProfile>(data);
        } else {
            profile = JSON.parse(data);
        }

        if (profile) {
            profile.lastUpdated = new Date(profile.lastUpdated);
        }
        return profile;
    } catch (error) {
        console.error('Error reading health profile:', error);
        return null;
    }
}

export function clearHealthProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PROFILE);
}

// ============ Consultations (ENCRYPTED) ============

export function saveConsultation(consultation: Consultation): void {
    const consultations = getConsultations();
    consultations.unshift(consultation);
    // Keep only last 50 consultations
    const trimmed = consultations.slice(0, 50);

    if (isEncryptionEnabled()) {
        const encrypted = encryptData(trimmed);
        localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, encrypted);
    } else {
        localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(trimmed));
    }
}

export function getConsultations(): Consultation[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
    if (!data) return [];

    try {
        let consultations: Consultation[];

        if (isEncryptionEnabled()) {
            consultations = decryptData<Consultation[]>(data) || [];
        } else {
            consultations = JSON.parse(data);
        }

        return consultations.map((c: Consultation) => ({
            ...c,
            timestamp: new Date(c.timestamp)
        }));
    } catch (error) {
        console.error('Error reading consultations:', error);
        return [];
    }
}

export function clearConsultations(): void {
    localStorage.removeItem(STORAGE_KEYS.CONSULTATIONS);
}

// ============ Language (NOT encrypted - not sensitive) ============

export function saveLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function getLanguage(): Language {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
}

// ============ Drug Search History (NOT encrypted - not sensitive) ============

export function saveDrugSearch(drugName: string): void {
    const history = getDrugHistory();
    // Remove if already exists
    const filtered = history.filter(d => d.toLowerCase() !== drugName.toLowerCase());
    filtered.unshift(drugName);
    // Keep only last 20
    const trimmed = filtered.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.DRUG_HISTORY, JSON.stringify(trimmed));
}

export function getDrugHistory(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.DRUG_HISTORY);
    return data ? JSON.parse(data) : [];
}

export function clearDrugHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.DRUG_HISTORY);
}

// ============ Chat History (ENCRYPTED) ============

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function saveChatHistory(module: string, messages: ChatMessage[]): void {
    const key = `aihealth_chat_${module}`;
    // Keep only last 50 messages per module
    const trimmed = messages.slice(-50);

    if (isEncryptionEnabled()) {
        const encrypted = encryptData(trimmed);
        localStorage.setItem(key, encrypted);
    } else {
        localStorage.setItem(key, JSON.stringify(trimmed));
    }
}

export function getChatHistory(module: string): ChatMessage[] {
    const key = `aihealth_chat_${module}`;
    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
        let messages: ChatMessage[];

        if (isEncryptionEnabled()) {
            messages = decryptData<ChatMessage[]>(data) || [];
        } else {
            messages = JSON.parse(data);
        }

        return messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }));
    } catch (error) {
        console.error('Error reading chat history:', error);
        return [];
    }
}

export function clearChatHistory(module?: string): void {
    if (module) {
        localStorage.removeItem(`aihealth_chat_${module}`);
    } else {
        // Clear all chat history
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('aihealth_chat_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

// ============ Clear All Data ============

export function clearAllData(): void {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('aihealth_')) {
            localStorage.removeItem(key);
        }
    });
}

// ============ Utilities ============

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export data (for backup purposes)
export function exportAllData(): string {
    const data = {
        healthProfile: getHealthProfile(),
        consultations: getConsultations(),
        drugHistory: getDrugHistory(),
        language: getLanguage(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

// Import data (restore from backup)
export function importData(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);

        if (data.healthProfile) {
            saveHealthProfile(data.healthProfile);
        }
        if (data.consultations) {
            data.consultations.forEach((c: Consultation) => {
                saveConsultation(c);
            });
        }
        if (data.drugHistory) {
            data.drugHistory.forEach((drug: string) => {
                saveDrugSearch(drug);
            });
        }
        if (data.language) {
            saveLanguage(data.language);
        }

        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

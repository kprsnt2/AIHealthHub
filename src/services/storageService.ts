import type { HealthProfile, Consultation, Language } from '../types';

const STORAGE_KEYS = {
    HEALTH_PROFILE: 'aihealth_profile',
    CONSULTATIONS: 'aihealth_consultations',
    LANGUAGE: 'aihealth_language',
    DRUG_HISTORY: 'aihealth_drug_history'
};

// Health Profile
export function saveHealthProfile(profile: HealthProfile): void {
    localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, JSON.stringify(profile));
}

export function getHealthProfile(): HealthProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_PROFILE);
    if (data) {
        const profile = JSON.parse(data);
        profile.lastUpdated = new Date(profile.lastUpdated);
        return profile;
    }
    return null;
}

export function clearHealthProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PROFILE);
}

// Consultations
export function saveConsultation(consultation: Consultation): void {
    const consultations = getConsultations();
    consultations.unshift(consultation);
    // Keep only last 50 consultations
    const trimmed = consultations.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(trimmed));
}

export function getConsultations(): Consultation[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
    if (data) {
        const consultations = JSON.parse(data);
        return consultations.map((c: Consultation) => ({
            ...c,
            timestamp: new Date(c.timestamp)
        }));
    }
    return [];
}

export function clearConsultations(): void {
    localStorage.removeItem(STORAGE_KEYS.CONSULTATIONS);
}

// Language preference
export function saveLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function getLanguage(): Language {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
}

// Drug search history
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

// Chat History - per module
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
    localStorage.setItem(key, JSON.stringify(trimmed));
}

export function getChatHistory(module: string): ChatMessage[] {
    const key = `aihealth_chat_${module}`;
    const data = localStorage.getItem(key);
    if (data) {
        const messages = JSON.parse(data);
        return messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }));
    }
    return [];
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

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

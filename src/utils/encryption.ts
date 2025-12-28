/**
 * Encryption Utility for localStorage
 * Provides optional encryption for sensitive health data
 */

import CryptoJS from 'crypto-js';

// Default encryption key - in production, this should be user-generated
const DEFAULT_KEY = 'aihealth_default_key_v1';

/**
 * Encrypt data before storing in localStorage
 * @param data - The data to encrypt (will be stringified)
 * @param key - Optional custom encryption key
 * @returns Encrypted string
 */
export function encryptData<T>(data: T, key: string = DEFAULT_KEY): string {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        // Fallback to plain JSON if encryption fails
        return JSON.stringify(data);
    }
}

/**
 * Decrypt data retrieved from localStorage
 * @param encryptedData - The encrypted string
 * @param key - Optional custom encryption key
 * @returns Decrypted and parsed data, or null if decryption fails
 */
export function decryptData<T>(encryptedData: string, key: string = DEFAULT_KEY): T | null {
    try {
        // Try to decrypt
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
            // If decryption produces empty string, try parsing as plain JSON
            // This handles migration from unencrypted to encrypted storage
            return JSON.parse(encryptedData) as T;
        }

        return JSON.parse(decryptedString) as T;
    } catch (error) {
        // Try parsing as plain JSON (for migration from unencrypted data)
        try {
            return JSON.parse(encryptedData) as T;
        } catch {
            console.error('Decryption error:', error);
            return null;
        }
    }
}

/**
 * Secure storage wrapper with optional encryption
 */
export const secureStorage = {
    /**
     * Save item with encryption
     */
    setItem<T>(key: string, value: T, encrypt: boolean = true, encryptionKey?: string): void {
        if (encrypt) {
            const encrypted = encryptData(value, encryptionKey);
            localStorage.setItem(key, encrypted);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    /**
     * Get item with decryption
     */
    getItem<T>(key: string, encrypted: boolean = true, encryptionKey?: string): T | null {
        const data = localStorage.getItem(key);
        if (!data) return null;

        if (encrypted) {
            return decryptData<T>(data, encryptionKey);
        } else {
            try {
                return JSON.parse(data) as T;
            } catch {
                return null;
            }
        }
    },

    /**
     * Remove item from storage
     */
    removeItem(key: string): void {
        localStorage.removeItem(key);
    },

    /**
     * Clear all app data
     */
    clearAll(): void {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('aihealth_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

/**
 * Generate a random encryption key
 * User can use this to create a personal key for extra security
 */
export function generateEncryptionKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password to use as encryption key
 * @param password - User's password
 * @returns Hashed password suitable for use as encryption key
 */
export function hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
}

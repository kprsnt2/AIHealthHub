/**
 * API Utilities for Gemini Service
 */

/**
 * Validate that the API key is configured
 * Throws an error with a helpful message if not
 */
export function validateApiKey(apiKey: string | undefined): void {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error(
            'Gemini API key is not configured. ' +
            'Please set VITE_GEMINI_API_KEY in your .env file.'
        );
    }
}

/**
 * Parse JSON from AI response text
 * Handles common issues like markdown code blocks and partial responses
 */
export function parseJsonResponse<T>(
    text: string,
    isArray: boolean = false
): T | null {
    try {
        // Remove markdown code blocks if present
        let cleaned = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Find JSON object or array in the response
        const pattern = isArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
        const match = cleaned.match(pattern);

        if (match) {
            return JSON.parse(match[0]) as T;
        }

        return null;
    } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return null;
    }
}

/**
 * Retry wrapper for async functions
 * Useful for handling transient API failures
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on the last attempt
            if (attempt < maxRetries) {
                console.warn(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // Exponential backoff
            }
        }
    }

    throw lastError;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
        return error.message.includes('429') ||
            error.message.toLowerCase().includes('rate limit');
    }
    return false;
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown, language: 'en' | 'te' = 'en'): string {
    if (isRateLimitError(error)) {
        return language === 'te'
            ? 'దయచేసి కొన్ని సెకన్లు వేచి ఉండి మళ్ళీ ప్రయత్నించండి.'
            : 'Please wait a few seconds and try again.';
    }

    if (error instanceof Error && error.message.includes('API key')) {
        return language === 'te'
            ? 'API కీ కాన్ఫిగర్ చేయబడలేదు.'
            : 'API key is not configured.';
    }

    return language === 'te'
        ? 'దయచేసి మళ్ళీ ప్రయత్నించండి.'
        : 'An error occurred. Please try again.';
}

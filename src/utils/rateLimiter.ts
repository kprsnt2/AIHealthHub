/**
 * Client-side Rate Limiter
 * Prevents users from spamming the API with too many requests
 */

// Rate limit configuration per endpoint type
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
    'drug-analysis': { maxRequests: 10, windowMs: 60000 },      // 10 per minute
    'symptom-analysis': { maxRequests: 5, windowMs: 60000 },    // 5 per minute
    'diet': { maxRequests: 5, windowMs: 60000 },                // 5 per minute
    'diet-plan': { maxRequests: 3, windowMs: 60000 },           // 3 per minute
    'second-opinion': { maxRequests: 3, windowMs: 60000 },      // 3 per minute
    'chat': { maxRequests: 20, windowMs: 60000 },               // 20 per minute
    'default': { maxRequests: 30, windowMs: 60000 },            // 30 per minute default
};

// Track request timestamps per endpoint
const requestHistory: Map<string, number[]> = new Map();

// Custom error for rate limiting
export class RateLimitError extends Error {
    remainingTime: number;

    constructor(message: string, remainingTime: number) {
        super(message);
        this.name = 'RateLimitError';
        this.remainingTime = remainingTime;
    }
}

/**
 * Check if a request is allowed under rate limits
 * @param endpoint - The endpoint type to check
 * @throws RateLimitError if rate limit exceeded
 */
export function checkRateLimit(endpoint: string): void {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get request history for this endpoint
    let history = requestHistory.get(endpoint) || [];

    // Filter to only requests within the window
    history = history.filter(timestamp => timestamp > windowStart);

    // Check if we've exceeded the limit
    if (history.length >= config.maxRequests) {
        const oldestRequest = history[0];
        const remainingTime = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
        throw new RateLimitError(
            `Too many requests. Please wait ${remainingTime} seconds.`,
            remainingTime
        );
    }

    // Add current request to history
    history.push(now);
    requestHistory.set(endpoint, history);
}

/**
 * Get remaining requests for an endpoint
 * @param endpoint - The endpoint type to check
 * @returns Number of remaining requests allowed
 */
export function getRemainingRequests(endpoint: string): number {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const history = requestHistory.get(endpoint) || [];
    const recentRequests = history.filter(timestamp => timestamp > windowStart);

    return Math.max(0, config.maxRequests - recentRequests.length);
}

/**
 * Get time until rate limit resets
 * @param endpoint - The endpoint type to check
 * @returns Milliseconds until reset, or 0 if not rate limited
 */
export function getTimeUntilReset(endpoint: string): number {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const history = requestHistory.get(endpoint) || [];
    const recentRequests = history.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= config.maxRequests && recentRequests.length > 0) {
        return recentRequests[0] + config.windowMs - now;
    }

    return 0;
}

/**
 * Clear rate limit history for an endpoint
 * Useful for testing or after a certain period
 */
export function clearRateLimit(endpoint?: string): void {
    if (endpoint) {
        requestHistory.delete(endpoint);
    } else {
        requestHistory.clear();
    }
}

/**
 * Debounce function to prevent rapid successive calls
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

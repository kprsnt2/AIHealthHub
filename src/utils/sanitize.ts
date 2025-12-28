import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'strong', 'b', 'em', 'i', 'u',
            'span', 'div',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['style', 'class'],
        ALLOW_DATA_ATTR: false
    });
}

/**
 * Format markdown-like text to HTML with sanitization
 * Converts common markdown patterns to safe HTML
 */
export function formatMarkdown(text: string, accentColor: string = 'var(--accent-cyan)'): string {
    const html = text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Headers - process larger ones first
        .replace(/^### (.*?)$/gm, `<h4 style="margin: 1rem 0 0.5rem; color: ${accentColor};">$1</h4>`)
        .replace(/^## (.*?)$/gm, '<h3 style="margin: 1.5rem 0 0.75rem; color: var(--text-primary);">$1</h3>')
        .replace(/^# (.*?)$/gm, '<h2 style="margin: 1.5rem 0 1rem; color: var(--text-primary);">$1</h2>')
        // Lists
        .replace(/^- (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$1</li>')
        .replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$2</li>')
        // Line breaks
        .replace(/\n/g, '<br/>');

    return sanitizeHtml(html);
}

/**
 * Create safe HTML content for dangerouslySetInnerHTML
 * Always use this instead of directly setting innerHTML from AI responses
 */
export function createSafeHtml(text: string, accentColor?: string): { __html: string } {
    return { __html: formatMarkdown(text, accentColor) };
}

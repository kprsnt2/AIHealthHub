import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Language } from '../types';
import { t } from '../i18n/translations';
import { createSafeHtml } from '../utils/sanitize';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    placeholder: string;
    language: Language;
}

export default function ChatInterface({
    messages,
    onSendMessage,
    isLoading,
    placeholder,
    language
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    }, [input, isLoading, onSendMessage]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    return (
        <div className="chat-container glass-card" role="region" aria-label="Chat interface">
            <div
                className="chat-messages"
                role="log"
                aria-live="polite"
                aria-atomic="false"
            >
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon" aria-hidden="true">💬</div>
                        <p className="empty-state-text">{t('startChat', language)}</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.role}`}
                            role="article"
                            aria-label={msg.role === 'user' ? 'Your message' : 'AI response'}
                        >
                            <div
                                className="message-content"
                                dangerouslySetInnerHTML={createSafeHtml(msg.content)}
                            />
                        </div>
                    ))
                )}
                {isLoading && (
                    <div
                        className="chat-message assistant"
                        role="status"
                        aria-label="AI is typing"
                    >
                        <div className="loading-dots" aria-hidden="true">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className="sr-only">AI is typing a response...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSubmit}
                className="chat-input-container"
                role="search"
            >
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="chat-input"
                    disabled={isLoading}
                    aria-label={placeholder}
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={!input.trim() || isLoading}
                    aria-label={t('sendMessage', language)}
                >
                    {isLoading ? (
                        <span className="loading-spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
                    ) : (
                        <>
                            <span aria-hidden="true">➤</span>
                            {t('send', language)}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

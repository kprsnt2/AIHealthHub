import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
    type: 'text' | 'card' | 'chat' | 'drug-info' | 'diagnosis';
    count?: number;
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
    const renderSkeleton = () => {
        switch (type) {
            case 'text':
                return (
                    <div className="skeleton skeleton-text">
                        <div className="skeleton-line long"></div>
                        <div className="skeleton-line medium"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                );

            case 'card':
                return (
                    <div className="skeleton skeleton-card">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-line long"></div>
                        <div className="skeleton-line medium"></div>
                    </div>
                );

            case 'chat':
                return (
                    <div className="skeleton skeleton-chat">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-bubble">
                            <div className="skeleton-line long"></div>
                            <div className="skeleton-line medium"></div>
                        </div>
                    </div>
                );

            case 'drug-info':
                return (
                    <div className="skeleton skeleton-drug-info">
                        <div className="skeleton-header">
                            <div className="skeleton-icon large"></div>
                            <div className="skeleton-title-group">
                                <div className="skeleton-line long"></div>
                                <div className="skeleton-line short"></div>
                            </div>
                        </div>
                        <div className="skeleton-section">
                            <div className="skeleton-line medium"></div>
                            <div className="skeleton-line long"></div>
                            <div className="skeleton-line long"></div>
                        </div>
                        <div className="skeleton-meter"></div>
                        <div className="skeleton-tags">
                            <div className="skeleton-tag"></div>
                            <div className="skeleton-tag"></div>
                            <div className="skeleton-tag"></div>
                        </div>
                    </div>
                );

            case 'diagnosis':
                return (
                    <div className="skeleton skeleton-diagnosis">
                        <div className="skeleton-badge"></div>
                        <div className="skeleton-line long"></div>
                        <div className="skeleton-line medium"></div>
                        <div className="skeleton-section">
                            <div className="skeleton-line short"></div>
                            <div className="skeleton-line long"></div>
                            <div className="skeleton-line long"></div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="loading-skeleton-container" role="status" aria-label="Loading content">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-item">
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
}

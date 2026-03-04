interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

export function ConfirmModal({
    title,
    message,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Huỷ',
    onConfirm,
    onCancel,
    danger = false,
}: ConfirmModalProps) {
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="confirm-icon-wrap">
                    <div className="confirm-icon">{danger ? '🗑️' : '❓'}</div>
                </div>

                <h2 className="confirm-title">{title}</h2>
                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button className="btn btn-glass" onClick={onCancel} style={{ flex: 1 }}>
                        {cancelLabel}
                    </button>
                    <button
                        className="btn"
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            background: danger
                                ? 'linear-gradient(145deg, #ff6b6b, #e63946, #c1121f)'
                                : 'linear-gradient(145deg, var(--primary-light), var(--primary), var(--primary-dark))',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: danger
                                ? '0 4px 20px rgba(230,57,70,0.5), 0 1px 0 rgba(255,255,255,0.2) inset'
                                : '0 4px 20px rgba(230,57,70,0.45)',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

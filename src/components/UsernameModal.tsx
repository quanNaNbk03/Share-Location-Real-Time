import { useState, useRef, useEffect } from 'react';

interface UsernameModalProps {
    onSubmit: (username: string) => void;
    initialValue?: string;
}

export function UsernameModal({ onSubmit, initialValue = '' }: UsernameModalProps) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus with slight delay for animation
        const t = setTimeout(() => inputRef.current?.focus(), 400);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Vui lòng nhập tên của bạn');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        if (trimmed.length < 2) {
            setError('Tên phải có ít nhất 2 ký tự');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        if (trimmed.length > 30) {
            setError('Tên không được quá 30 ký tự');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        setError('');
        onSubmit(trimmed);
    };

    return (
        <div className="username-overlay">
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
                <div className="bg-blob bg-blob-3" />
            </div>

            <div className={`username-modal ${shake ? 'shake' : ''}`}>
                {/* Icon */}
                <div className="username-icon-wrap">
                    <div className="username-icon">👤</div>
                </div>

                <h2 className="username-title">Bạn là ai?</h2>
                <p className="username-subtitle">
                    Nhập tên hiển thị để mọi người biết ai đang chia sẻ vị trí
                </p>

                <form onSubmit={handleSubmit} className="username-form">
                    <div className="username-input-wrap">
                        <span className="username-input-icon">✨</span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="username-input"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (error) setError('');
                            }}
                            maxLength={30}
                            autoComplete="off"
                        />
                    </div>

                    {error && (
                        <div className="username-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg btn-block">
                        🚀 Bắt đầu chia sẻ
                    </button>
                </form>

                <p className="username-hint">
                    💡 Tên sẽ được lưu trên thiết bị này
                </p>
            </div>
        </div>
    );
}

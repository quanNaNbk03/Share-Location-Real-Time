import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomId } from '../utils/roomId';
import { ThemeToggle } from '../components/ThemeToggle';

export function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Hiệu ứng stars
    const [stars] = useState(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 3,
        }))
    );

    const handleCreate = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600)); // feedback delay
        const id = generateRoomId();
        navigate(`/share/${id}`);
    };

    return (
        <div className="app-layout">
            {/* Background */}
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
                {stars.map((star) => (
                    <div
                        key={star.id}
                        style={{
                            position: 'absolute',
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.6)',
                            animation: `blink ${2 + star.delay}s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className="page-container">
                {/* Header */}
                <div className="flex justify-between items-center z-1" style={{ marginBottom: 8 }}>
                    <div />
                    <ThemeToggle />
                </div>

                {/* Hero */}
                <div className="hero-section">
                    <div className="hero-icon">🎓</div>

                    <div>
                        <h1 className="hero-title">Tìm nhau ngày<br />Tốt nghiệp</h1>
                        <p className="hero-subtitle mt-8">
                            Chia sẻ vị trí của bạn cho gia đình trong khuôn viên trường — đơn giản, nhanh chóng, miễn phí.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="features-grid w-full">
                        <div className="glass-card-sm feature-item">
                            <span className="feature-icon">📍</span>
                            <span className="feature-label">Vị trí thực tế</span>
                        </div>
                        <div className="glass-card-sm feature-item">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-label">Cập nhật ngay</span>
                        </div>
                        <div className="glass-card-sm feature-item">
                            <span className="feature-icon">🔒</span>
                            <span className="feature-label">Link riêng tư</span>
                        </div>
                        <div className="glass-card-sm feature-item">
                            <span className="feature-icon">🆓</span>
                            <span className="feature-label">Hoàn toàn miễn phí</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-12 w-full">
                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Đang tạo phòng...
                                </>
                            ) : (
                                <>🚀 Tạo Room chia sẻ ngay</>
                            )}
                        </button>
                        <p className="subtitle text-center">
                            Nhận link → gửi cho ba mẹ → họ thấy bạn trên bản đồ 🗺️
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p
                    className="text-center"
                    style={{ color: 'var(--text-muted)', fontSize: '0.78rem', paddingBottom: 16, zIndex: 1 }}
                >
                    Made with ❤️ cho ngày Tốt nghiệp
                </p>
            </div>
        </div>
    );
}

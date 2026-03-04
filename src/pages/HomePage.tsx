import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomId } from '../utils/roomId';
import { ThemeToggle } from '../components/ThemeToggle';
import { UsernameModal } from '../components/UsernameModal';
import { useUsername } from '../hooks/useUsername';
import { useRoomHistory } from '../hooks/useRoomHistory';

export function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { username, hasUsername, setUsername } = useUsername();
    const { historyRooms, loading: historyLoading } = useRoomHistory(username);
    const [showNameModal, setShowNameModal] = useState(false);

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

    const proceedToRoom = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600)); // feedback delay
        const id = generateRoomId();
        navigate(`/share/${id}`);
    };

    const handleCreate = () => {
        if (!hasUsername) {
            setShowNameModal(true);
        } else {
            proceedToRoom();
        }
    };

    const handleNameSubmit = (name: string) => {
        setUsername(name);
        setShowNameModal(false);
        proceedToRoom();
    };

    return (
        <div className="app-layout">
            {/* Background */}
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
                <div className="bg-blob bg-blob-3" />
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
                            background: 'rgba(255,255,255,0.55)',
                            animation: `dotBlink ${2 + star.delay}s ease-in-out infinite`,
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
                        <h1 className="hero-title">-Easy-<br />Find me</h1>
                        <p className="hero-subtitle mt-8">
                            Chia sẻ vị trí của bạn cho mọi người đơn giản, nhanh chóng, miễn phí.
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
                            <span className="feature-label">Cập nhật liên tục</span>
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
                    </div>

                    {/* Room History List */}
                    {hasUsername && (
                        <div className="history-section w-full mt-24">
                            <h3 className="section-title text-left mb-16" style={{ fontSize: '1.2rem' }}>
                                🕒 Lịch sử phòng của {username}
                            </h3>

                            {historyLoading ? (
                                <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử...</p>
                            ) : historyRooms.length === 0 ? (
                                <div className="glass-card-sm text-center" style={{ padding: '20px' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Chưa có phòng nào đang hoạt động.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-12">
                                    {historyRooms.map((r) => (
                                        <div
                                            key={r.id}
                                            className="glass-card-sm flex justify-between items-center"
                                            style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)' }}
                                        >
                                            <div className="flex flex-col">
                                                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                    #{r.id}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Cập nhật: {new Date(r.updatedAt).toLocaleTimeString('vi-VN')}
                                                </span>
                                                {r.roomData?.location && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        📍 {r.roomData.location.lat.toFixed(4)}, {r.roomData.location.lng.toFixed(4)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-8">
                                                <button
                                                    onClick={() => navigate(`/share/${r.id}`)}
                                                    className="btn btn-glass btn-sm"
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    ⚙️ Quản lý
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/room/${r.id}`)}
                                                    className="btn btn-accent btn-sm"
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    👁 Xem
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Footer */}
                <p
                    className="text-center"
                    style={{ color: 'var(--text-muted)', fontSize: '0.78rem', paddingBottom: 16, zIndex: 1 }}
                >
                    Made with ❤️ cho ngày Tốt nghiệp
                </p>
            </div>

            {showNameModal && (
                <UsernameModal onSubmit={handleNameSubmit} />
            )}
        </div>

    );
}

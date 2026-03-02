import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MapView } from '../components/MapView';
import { useRoom } from '../hooks/useRoom';
import { isValidRoomId } from '../utils/roomId';

function formatRelativeTime(ts: number | null): string {
    if (!ts) return '—';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'Vừa xong';
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return `${Math.floor(diff / 3600)} giờ trước`;
}

export function ViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { roomData, isConnected } = useRoom(id ?? null);

    useEffect(() => {
        if (id && !isValidRoomId(id)) navigate('/');
    }, [id, navigate]);

    return (
        <div
            className="app-layout"
            style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}
        >
            {/* Header */}
            <div
                className="glass-card-sm"
                style={{
                    margin: '12px 12px 0',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    flexShrink: 0,
                }}
            >
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Trang chủ
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="flex items-center gap-8">
                        <span
                            className="status-dot"
                            style={{
                                background: isConnected ? '#4ade80' : '#f87171',
                                boxShadow: isConnected ? '0 0 8px #4ade80' : 'none',
                            }}
                        />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                        </span>
                    </div>
                    <span className="room-id-badge" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        #{id}
                    </span>
                </div>
            </div>

            {/* Map — chiếm hết không gian còn lại */}
            <div style={{ flex: 1, position: 'relative', margin: '12px', borderRadius: 24, overflow: 'hidden' }}>
                {roomData.location ? (
                    <>
                        <MapView
                            lat={roomData.location.lat}
                            lng={roomData.location.lng}
                        />
                        {/* Overlay thông tin */}
                        <div
                            className="glass-card-sm"
                            style={{
                                position: 'absolute',
                                bottom: 16,
                                left: 16,
                                right: 16,
                                padding: '14px 18px',
                                zIndex: 1000,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        Cập nhật lần cuối
                                    </p>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {formatRelativeTime(roomData.updatedAt)}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        Trạng thái
                                    </p>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {roomData.status === 'moving' ? '🏃 Di chuyển' : '🧍 Đứng yên'}
                                    </p>
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: 10,
                                    paddingTop: 10,
                                    borderTop: '1px solid var(--glass-border)',
                                    fontSize: '0.78rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                📍 {roomData.location.lat.toFixed(5)}, {roomData.location.lng.toFixed(5)}
                                {roomData.source && (
                                    <span style={{ marginLeft: 12, opacity: 0.7 }}>
                                        via {roomData.source === 'manual' ? 'Thủ công' : 'Tự động'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* No location yet */
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            background: 'var(--surface)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div style={{ fontSize: '4rem' }}>📡</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Chờ vị trí...
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 260 }}>
                            Sinh viên cần mở link chia sẻ và nhấn "Cập nhật vị trí" để bạn thấy trên bản đồ
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isValidRoomId } from '../utils/roomId';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRoom } from '../hooks/useRoom';
import { ThemeToggle } from '../components/ThemeToggle';
import { OwnTracksCard } from '../components/OwnTracksCard';

type Mode = 'manual' | 'auto' | 'owntracks';

export function SharePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>('manual');
    const [autoActive, setAutoActive] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { fetchPosition, loading: gpsLoading, error: gpsError } = useGeolocation();
    const { roomData, updateLocation } = useRoom(id ?? null);

    // Validate room id
    useEffect(() => {
        if (id && !isValidRoomId(id)) navigate('/');
    }, [id, navigate]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    };

    // Manual update
    const handleManualUpdate = async () => {
        const coords = await fetchPosition();
        if (coords) {
            await updateLocation(coords.latitude, coords.longitude, 'manual');
            showToast('✅ Đã cập nhật vị trí!');
        }
    };

    // Auto update toggle
    const startAuto = useCallback(async () => {
        const doUpdate = async () => {
            const coords = await fetchPosition();
            if (coords) {
                await updateLocation(coords.latitude, coords.longitude, 'web_auto');
            }
        };
        await doUpdate();
        intervalRef.current = setInterval(doUpdate, 30000);
        setAutoActive(true);
        showToast('🔄 Đã bật tự động cập nhật (30s)');
    }, [fetchPosition, updateLocation]);

    const stopAuto = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setAutoActive(false);
        showToast('⏸ Đã tắt tự động cập nhật');
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Copy share link
    const viewLink = `${window.location.origin}/room/${id}`;
    const handleCopy = async () => {
        await navigator.clipboard.writeText(viewLink);
        setCopied(true);
        showToast('📋 Đã sao chép link!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleModeSwitch = (newMode: Mode) => {
        if (newMode === 'owntracks') return; // coming soon
        if (autoActive) stopAuto();
        setMode(newMode);
    };

    return (
        <div className="app-layout">
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
            </div>

            <div className="page-container">
                {/* Header */}
                <div className="flex justify-between items-center z-1" style={{ marginBottom: 20 }}>
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Trang chủ
                    </button>
                    <ThemeToggle />
                </div>

                {/* Room ID */}
                <div className="flex flex-col gap-8 z-1" style={{ marginBottom: 24 }}>
                    <p className="subtitle">📍 Phòng của bạn</p>
                    <div className="flex items-center gap-12">
                        <span className="room-id-badge">#{id}</span>
                        <a
                            href={`/room/${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-glass btn-sm"
                        >
                            👁 Xem bản đồ
                        </a>
                    </div>
                </div>

                {/* Share Link */}
                <div className="glass-card-sm z-1" style={{ padding: 16, marginBottom: 20 }}>
                    <p className="status-label" style={{ marginBottom: 8 }}>🔗 Link chia sẻ cho gia đình</p>
                    <div className="share-link-box">
                        <span className="share-link-text">{viewLink}</span>
                        <button className="btn btn-accent btn-sm" onClick={handleCopy}>
                            {copied ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                    </div>
                </div>

                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
                        onClick={() => handleModeSwitch('manual')}
                    >
                        <span className="tab-icon">📍</span>
                        Chốt vị trí
                    </button>
                    <button
                        className={`mode-tab ${mode === 'auto' ? 'active' : ''}`}
                        onClick={() => handleModeSwitch('auto')}
                    >
                        <span className="tab-icon">🔄</span>
                        Tự động
                    </button>
                    <button
                        className="mode-tab coming-soon"
                        onClick={() => handleModeSwitch('owntracks')}
                        disabled
                    >
                        <span className="tab-icon">🧭</span>
                        OwnTracks
                        <span className="coming-soon-badge">Sắp có</span>
                    </button>
                </div>

                {/* Mode Content */}
                <div className="mode-content">
                    {mode === 'manual' && (
                        <div className="glass-card mode-panel">
                            <p className="section-title">📍 Chốt vị trí thủ công</p>
                            <p className="subtitle" style={{ marginBottom: 20 }}>
                                Nhấn nút để lấy vị trí GPS hiện tại và gửi lên một lần.
                            </p>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleManualUpdate}
                                disabled={gpsLoading}
                            >
                                {gpsLoading ? '📡 Đang lấy GPS...' : '📍 Cập nhật vị trí ngay'}
                            </button>
                            {gpsError && (
                                <p style={{ color: '#ff6b74', fontSize: '0.85rem', marginTop: 12 }}>
                                    ⚠️ {gpsError}
                                </p>
                            )}
                            <StatusDisplay data={roomData} />
                        </div>
                    )}

                    {mode === 'auto' && (
                        <div className="glass-card mode-panel">
                            <p className="section-title">🔄 Tự động cập nhật (30 giây)</p>
                            <p className="subtitle" style={{ marginBottom: 20 }}>
                                Vị trí sẽ tự động gửi mỗi 30 giây. Giữ màn hình sáng để hoạt động liên tục.
                            </p>
                            {!autoActive ? (
                                <button className="btn btn-accent btn-block" onClick={startAuto} disabled={gpsLoading}>
                                    {gpsLoading ? '📡 Đang lấy GPS...' : '▶ Bật tự động cập nhật'}
                                </button>
                            ) : (
                                <button className="btn btn-glass btn-block" onClick={stopAuto}>
                                    ⏹ Dừng tự động cập nhật
                                </button>
                            )}
                            {autoActive && (
                                <div className="status-display" style={{ marginTop: 16 }}>
                                    <div className="flex items-center gap-8">
                                        <span className="status-dot active" />
                                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                                            Đang chạy — cập nhật mỗi 30 giây
                                        </span>
                                    </div>
                                </div>
                            )}
                            {gpsError && (
                                <p style={{ color: '#ff6b74', fontSize: '0.85rem', marginTop: 12 }}>
                                    ⚠️ {gpsError}
                                </p>
                            )}
                            <StatusDisplay data={roomData} />
                        </div>
                    )}

                    {mode === 'owntracks' && <OwnTracksCard />}
                </div>
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}

function StatusDisplay({ data }: { data: ReturnType<typeof useRoom>['roomData'] }) {
    if (!data.updatedAt) return null;
    return (
        <div className="status-display">
            <div className="status-row">
                <span className="status-label">Cập nhật lần cuối</span>
                <span className="status-value">{new Date(data.updatedAt).toLocaleTimeString('vi-VN')}</span>
            </div>
            {data.location && (
                <>
                    <div className="status-row">
                        <span className="status-label">Tọa độ</span>
                        <span className="status-value">
                            {data.location.lat.toFixed(5)}, {data.location.lng.toFixed(5)}
                        </span>
                    </div>
                    <div className="status-row">
                        <span className="status-label">Trạng thái</span>
                        <span className="status-value">
                            {data.status === 'moving' ? '🏃 Đang di chuyển' : '🧍 Đứng yên'}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

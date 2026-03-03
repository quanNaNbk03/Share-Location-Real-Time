import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isValidRoomId } from '../utils/roomId';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRoom } from '../hooks/useRoom';
import { ThemeToggle } from '../components/ThemeToggle';
import { OwnTracksCard } from '../components/OwnTracksCard';
import { useUsername } from '../hooks/useUsername';
import { UsernameModal } from '../components/UsernameModal';

type Mode = 'manual' | 'auto' | 'owntracks';

export function SharePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>('manual');
    const [autoActive, setAutoActive] = useState(false);
    const [autoInterval, setAutoInterval] = useState<number>(30000);
    const [toast, setToast] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { username, hasUsername, setUsername } = useUsername();
    const [showNameModal, setShowNameModal] = useState(!hasUsername);

    const { fetchPosition, loading: gpsLoading, error: gpsError } = useGeolocation();
    const { roomData, updateLocation } = useRoom(id ?? null);

    // Validate room id
    useEffect(() => {
        if (id && !isValidRoomId(id)) navigate('/');
    }, [id, navigate]);

    // Hiện lại modal nếu mất username
    useEffect(() => {
        if (!hasUsername) {
            setShowNameModal(true);
        }
    }, [hasUsername]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    };

    // Hàm gọi GPS + Gửi DB
    const executeUpdate = useCallback(async () => {
        const coords = await fetchPosition();
        if (coords) {
            await updateLocation(coords.latitude, coords.longitude, 'web_auto', username || undefined);
        }
    }, [fetchPosition, updateLocation, username]);

    // Manual update
    const handleManualUpdate = async () => {
        if (!hasUsername) {
            setShowNameModal(true);
            return;
        }
        const coords = await fetchPosition();
        if (coords) {
            await updateLocation(coords.latitude, coords.longitude, 'manual', username || undefined);
            showToast('✅ Đã cập nhật vị trí!');
        }
    };

    const startAuto = () => {
        if (!hasUsername) {
            setShowNameModal(true);
            return;
        }

        executeUpdate(); // Fetch once right away

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            executeUpdate();
        }, autoInterval);

        setAutoActive(true);
        showToast(`🔄 Đã bật định kỳ chạy (${autoInterval >= 60000 ? autoInterval / 60000 + ' phút' : autoInterval / 1000 + 's'})`);
    };

    const stopAuto = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setAutoActive(false);
        showToast('⏸ Đã tắt tự động cập nhật');
    };

    const handleIntervalChange = (newInterval: number) => {
        setAutoInterval(newInterval);
        if (autoActive) { // Hot update interval timer while active mode running
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                executeUpdate();
            }, newInterval);
            showToast(`🔄 Đổi chu kì thành ${newInterval >= 60000 ? newInterval / 60000 + ' phút' : newInterval / 1000 + 's'}`);
        }
    };

    // Cleanup global unmount
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

    const handleNameSubmit = (name: string) => {
        setUsername(name);
        setShowNameModal(false);
    };

    return (
        <div className="app-layout">
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
                <div className="bg-blob bg-blob-3" />
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

                {/* Info Card current username */}
                <div className="glass-card-sm z-1 flex justify-between items-center" style={{ padding: '12px 16px', marginBottom: 20 }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chia sẻ với tên:</span>
                        <div style={{ fontWeight: 600 }}>{username || '...'}</div>
                    </div>
                    <button className="btn btn-glass btn-sm" onClick={() => setShowNameModal(true)}>
                        ✏️ Sửa
                    </button>
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
                                <div className="error-msg">⚠️ {gpsError}</div>
                            )}
                            <StatusDisplay data={roomData} />
                        </div>
                    )}

                    {mode === 'auto' && (
                        <div className="glass-card mode-panel">
                            <p className="section-title">🔄 Tự động cập nhật</p>
                            <p className="subtitle" style={{ marginBottom: 16 }}>
                                Vị trí sẽ tự động gửi theo mỗi chu kì. Giữ màn hình sáng để hoạt động liên tục.
                            </p>

                            <div style={{ marginBottom: 20 }}>
                                <select
                                    value={autoInterval}
                                    onChange={(e) => handleIntervalChange(Number(e.target.value))}
                                    disabled={autoActive}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 14px',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        opacity: autoActive ? 0.6 : 1
                                    }}
                                >
                                    <option value={10000} style={{ color: 'black' }}>Mỗi 10 giây</option>
                                    <option value={15000} style={{ color: 'black' }}>Mỗi 15 giây (Nhanh)</option>
                                    <option value={30000} style={{ color: 'black' }}>Mỗi 30 giây (Chuẩn)</option>
                                    <option value={60000} style={{ color: 'black' }}>Mỗi 1 phút (Tiết kiệm pin)</option>
                                    <option value={180000} style={{ color: 'black' }}>Mỗi 3 phút</option>
                                    <option value={300000} style={{ color: 'black' }}>Mỗi 5 phút</option>
                                    <option value={600000} style={{ color: 'black' }}>Mỗi 10 phút</option>
                                    <option value={1200000} style={{ color: 'black' }}>Mỗi 20 phút</option>
                                </select>
                            </div>

                            {!autoActive ? (
                                <button className="btn btn-accent btn-block" onClick={startAuto} disabled={gpsLoading}>
                                    {gpsLoading ? '📡 Đang lấy GPS...' : '▶ Bật tự động cập nhật'}
                                </button>
                            ) : (
                                <button className="btn btn-stop btn-block" onClick={stopAuto}>
                                    ⏹ Dừng tự động cập nhật
                                </button>
                            )}
                            {autoActive && (
                                <div className="status-display" style={{ marginTop: 16 }}>
                                    <div className="flex items-center gap-8">
                                        <span className="status-dot active" />
                                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            Đang chạy — cập nhật mỗi {autoInterval >= 60000 ? `${autoInterval / 60000} phút` : `${autoInterval / 1000} giây`}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {gpsError && (
                                <div className="error-msg">⚠️ {gpsError}</div>
                            )}
                            <StatusDisplay data={roomData} />
                        </div>
                    )}

                    {mode === 'owntracks' && <OwnTracksCard />}
                </div>

                {/* Instruction Board */}
                <div className="glass-card instruction-board">
                    <h2 className="instruction-title">Hướng dẫn sử dụng</h2>

                    <div className="instruction-step">
                        <div className="instruction-step-num">1</div>
                        <div className="instruction-step-content">
                            <span className="instruction-step-title">Cập nhật vị trí</span>
                            <span className="instruction-step-desc">Chọn chế độ và cập nhật vị trí của bạn lên bản đồ</span>
                        </div>
                    </div>

                    <div className="instruction-step">
                        <div className="instruction-step-num">2</div>
                        <div className="instruction-step-content">
                            <span className="instruction-step-title">Chia sẻ vị trí</span>
                            <span className="instruction-step-desc">Sao chép link phía trên và gửi cho gia đình, bạn bè</span>
                        </div>
                    </div>

                    <div className="instruction-step">
                        <div className="instruction-step-num">3</div>
                        <div className="instruction-step-content">
                            <span className="instruction-step-title">Tuỳ chỉnh tự động</span>
                            <span className="instruction-step-desc">Có thể chọn tự động cập nhật liên tục thời gian tuỳ ý</span>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <div className="toast">{toast}</div>}

            {showNameModal && (
                <UsernameModal onSubmit={handleNameSubmit} initialValue={username || ''} />
            )}
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


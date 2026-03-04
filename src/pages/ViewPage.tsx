import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapView } from '../components/MapView';
import { useRoom } from '../hooks/useRoom';
import { isValidRoomId } from '../utils/roomId';
import { ThemeToggle } from '../components/ThemeToggle';

function formatRelativeTime(ts: number | null): string {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'Vừa xong ✨';
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  return `${Math.floor(diff / 3600)} giờ trước`;
}

export function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roomData, isConnected } = useRoom(id ?? null);
  // Tick mỗi 10s để time label cập nhật
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (id && !isValidRoomId(id)) navigate('/');
  }, [id, navigate]);

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <div
        className="glass-card-sm"
        style={{
          margin: '10px 10px 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Connection status */}
          <div className="flex items-center gap-8">
            <span
              className={`status-dot ${isConnected ? 'active' : 'idle'}`}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {isConnected ? 'Live' : 'Kết nối...'}
            </span>
          </div>
          <span className="room-id-badge" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            #{id}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', margin: '10px', borderRadius: 22, overflow: 'hidden', minHeight: 0 }}>
        {roomData.location ? (
          <>
            <MapView lat={roomData.location.lat} lng={roomData.location.lng} username={roomData.username} />

            {/* Info overlay — theo theme */}
            <div
              className="map-info-overlay"
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                padding: '16px 20px',
                zIndex: 1000,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Last update */}
                <div>
                  <p className="info-label">Cập nhật lần cuối</p>
                  <p className="info-value">{formatRelativeTime(roomData.updatedAt)}</p>
                </div>
                {/* Status */}
                <div style={{ textAlign: 'right' }}>
                  <p className="info-label">Của: {roomData.username ? <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{roomData.username}</span> : 'Ai đó'} </p>
                  <p className="info-value">
                    {roomData.status === 'moving' ? '🏃 Di chuyển' : '🧍 Đứng yên'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--glass-border)', margin: '12px 0 10px' }} />

              {/* Coords + source */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="info-coords">
                  📍 {roomData.location.lat.toFixed(5)}, {roomData.location.lng.toFixed(5)}
                </p>
                {roomData.source && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      background: 'var(--surface)',
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontWeight: 600,
                    }}
                  >
                    {roomData.source === 'manual' ? 'Thủ công' : 'Tự động 🔄'}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Waiting for location */
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--blur)',
            }}
          >
            <div style={{ fontSize: '4rem', animation: 'heroPulse 3s infinite' }}>📡</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Đang chờ vị trí...
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                maxWidth: 260,
                lineHeight: 1.6,
              }}
            >
              Sinh viên cần mở link chia sẻ và nhấn "Cập nhật vị trí" để hiện trên bản đồ
            </p>
            <div
              className="glass-card-sm"
              style={{
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className="status-dot active" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Đang lắng nghe Firebase...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

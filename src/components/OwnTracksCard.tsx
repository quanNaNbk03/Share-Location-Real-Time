export function OwnTracksCard() {
    return (
        <div className="glass-card owntracks-card">
            <div className="owntracks-icon">🧭</div>
            <p className="owntracks-title">Theo dõi chạy ngầm</p>
            <p className="owntracks-desc">
                Cài app OwnTracks trên điện thoại, vị trí tự động gửi liên tục dù bạn khoá màn hình — tiết kiệm pin tối đa.
            </p>
            <span className="owntracks-badge">⏳ Sắp ra mắt</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Hãy dùng chế độ Thủ công hoặc Tự động trong lúc này
            </p>
        </div>
    );
}

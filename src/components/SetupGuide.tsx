export function SetupGuide() {
    return (
        <div className="app-layout">
            <div className="bg-decoration">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
            </div>
            <div className="page-container" style={{ justifyContent: 'center', gap: 24, zIndex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚙️</div>
                    <h1 className="page-title" style={{ marginBottom: 8 }}>Cần cấu hình Firebase</h1>
                    <p className="subtitle">Tạo file <code style={{ background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>.env.local</code> trong thư mục dự án</p>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                    <p className="section-title" style={{ marginBottom: 16 }}>📋 Các bước thực hiện</p>
                    <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        <li>Truy cập <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>console.firebase.google.com</a></li>
                        <li>Tạo Project mới → Thêm Web App</li>
                        <li>Bật <strong style={{ color: 'var(--text-primary)' }}>Realtime Database</strong> (Build → Realtime Database)</li>
                        <li>Sao chép <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>firebaseConfig</code> từ Project Settings</li>
                        <li>Tạo file <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>.env.local</code> theo mẫu <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>.env.example</code></li>
                        <li>Chạy lại <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>npm run dev</code></li>
                    </ol>
                </div>

                <div className="glass-card-sm" style={{ padding: 16 }}>
                    <p className="status-label" style={{ marginBottom: 8 }}>📄 Nội dung file .env.local</p>
                    <pre style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'monospace', lineHeight: 1.8, overflowX: 'auto' }}>
                        {`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...your.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=...rtdb.asia-southeast1...
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
                    </pre>
                </div>

                <div className="glass-card-sm" style={{ padding: 16, borderLeft: '3px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        🔒 <strong style={{ color: 'var(--text-primary)' }}>Bảo mật:</strong> File <code style={{ fontFamily: 'monospace' }}>.env.local</code> đã được thêm vào <code style={{ fontFamily: 'monospace' }}>.gitignore</code> và sẽ không bao giờ bị commit lên Git.
                    </p>
                </div>
            </div>
        </div>
    );
}

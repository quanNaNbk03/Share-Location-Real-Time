import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeToggle';
import { SetupGuide } from './components/SetupGuide';
import { HomePage } from './pages/HomePage';
import { SharePage } from './pages/SharePage';
import { ViewPage } from './pages/ViewPage';
import { isFirebaseConfigured } from './lib/firebase';
import './styles/index.css';

function App() {
  // Khi chưa cấu hình Firebase, hiển thị hướng dẫn thay vì crash
  if (!isFirebaseConfigured) {
    return (
      <ThemeProvider>
        <SetupGuide />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/share/:id" element={<SharePage />} />
          <Route path="/room/:id" element={<ViewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

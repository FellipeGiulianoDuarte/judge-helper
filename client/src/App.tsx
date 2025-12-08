import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { AppLayout } from './components/AppLayout';
import { DocumentsPage } from './pages/DocumentsPage';
import { DeckCheckPage } from './pages/DeckCheckPage';
import { TableJudgePage } from './pages/TableJudgePage';
import RoundTimerPage from './pages/RoundTimerPage';
import RoundTimerDisplayPage from './pages/RoundTimerDisplayPage';

function App() {
  const lastTab = localStorage.getItem('lastTab') || '/table-judge';

  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-screen display route without AppLayout */}
          <Route path="/round-timer-display" element={<RoundTimerDisplayPage />} />
          
          {/* Regular routes with AppLayout */}
          <Route path="/" element={<AppLayout><Navigate to={lastTab} replace /></AppLayout>} />
          <Route path="/table-judge" element={<AppLayout><TableJudgePage /></AppLayout>} />
          <Route path="/deck-check" element={<AppLayout><DeckCheckPage /></AppLayout>} />
          <Route path="/docs" element={<AppLayout><DocumentsPage /></AppLayout>} />
          <Route path="/round-timer" element={<AppLayout><RoundTimerPage /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

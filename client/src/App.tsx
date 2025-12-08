import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { AppLayout } from './components/AppLayout';
import { DocumentsPage } from './pages/DocumentsPage';
import { DeckCheckPage } from './pages/DeckCheckPage';
import { TableJudgePage } from './pages/TableJudgePage';

function App() {
  const lastTab = localStorage.getItem('lastTab') || '/table-judge';

  return (
    <MantineProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to={lastTab} replace />} />
            <Route path="/table-judge" element={<TableJudgePage />} />
            <Route path="/deck-check" element={<DeckCheckPage />} />
            <Route path="/docs" element={<DocumentsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

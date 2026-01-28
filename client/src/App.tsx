import '@mantine/core/styles.css';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { AppLayout } from './components/AppLayout';
import { DocumentsPage } from './pages/DocumentsPage';
import { DeckCheckPage } from './pages/DeckCheckPage';
import { TableJudgePage } from './pages/TableJudgePage';
import RoundTimerPage from './pages/RoundTimerPage';
import RoundTimerDisplayPage from './pages/RoundTimerDisplayPage';
import TimeExtensionsPage from './pages/TimeExtensionsPage';
import { OnboardingWizardProvider } from './components/OnboardingWizard/OnboardingWizardContext';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'color-scheme' });

function App() {
  const lastTab = localStorage.getItem('lastTab') || '/table-judge';

  return (
    <MantineProvider colorSchemeManager={colorSchemeManager} defaultColorScheme="light">
      <BrowserRouter>
        <OnboardingWizardProvider>
          <Routes>
            {/* Full-screen display route without AppLayout */}
            <Route path="/round-timer-display" element={<RoundTimerDisplayPage />} />

            {/* Regular routes with AppLayout */}
            <Route path="/" element={<AppLayout><Navigate to={lastTab} replace /></AppLayout>} />
            <Route path="/table-judge" element={<AppLayout><TableJudgePage /></AppLayout>} />
            <Route path="/deck-check" element={<AppLayout><DeckCheckPage /></AppLayout>} />
            <Route path="/docs" element={<AppLayout><DocumentsPage /></AppLayout>} />
            <Route path="/round-timer" element={<AppLayout><RoundTimerPage /></AppLayout>} />
            <Route path="/time-extensions" element={<AppLayout><TimeExtensionsPage /></AppLayout>} />
          </Routes>
        </OnboardingWizardProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

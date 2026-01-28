import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Box, Select, Group, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useOnboardingWizard } from './OnboardingWizard/OnboardingWizardContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const IconSun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

const IconInfo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export function AppLayout({ children }: AppLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { startWizard } = useOnboardingWizard();

  const currentTab = location.pathname === '/' ? '/table-judge' : location.pathname;

  const handleTabChange = (value: string | null) => {
    if (value) {
      navigate(value);
      localStorage.setItem('lastTab', value);
    }
  };

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
      localStorage.setItem('locale', value);
    }
  };

  return (
    <Box maw={480} mx="auto" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tabs.List grow data-wizard-tabs>
          <Tabs.Tab value="/table-judge">{t('tabs.tableJudge')}</Tabs.Tab>
          <Tabs.Tab value="/deck-check">{t('tabs.deckCheck')}</Tabs.Tab>
          <Tabs.Tab value="/round-timer">{t('tabs.roundTimer')}</Tabs.Tab>
          <Tabs.Tab value="/time-extensions">{t('tabs.timeExtensions')}</Tabs.Tab>
          <Tabs.Tab value="/docs">{t('tabs.documents')}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Group justify="flex-start" p="xs" gap="xs" style={{ width: '100%' }}>
        <ActionIcon
          variant="default"
          size="lg"
          aria-label={t('onboarding.infoButton')}
          onClick={startWizard}
          data-wizard-info
        >
          <IconInfo />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="lg"
          aria-label={t('theme.toggle')}
          onClick={() => toggleColorScheme()}
          data-wizard-theme
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </ActionIcon>
        <Select
          size="xs"
          w={120}
          aria-label={t('language.select')}
          value={i18n.language}
          onChange={handleLanguageChange}
          data={[
            { value: 'en', label: 'EN' },
            { value: 'pt', label: 'PT' },
            { value: 'es', label: 'ES' },
          ]}
          data-wizard-language
        />
      </Group>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

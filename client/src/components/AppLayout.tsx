import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Box, Select, Group } from '@mantine/core';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
        <Tabs.List grow>
          <Tabs.Tab value="/table-judge">{t('tabs.tableJudge')}</Tabs.Tab>
          <Tabs.Tab value="/deck-check">{t('tabs.deckCheck')}</Tabs.Tab>
          <Tabs.Tab value="/docs">{t('tabs.documents')}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Group justify="flex-end" p="xs">
        <Select
          size="xs"
          w={120}
          value={i18n.language}
          onChange={handleLanguageChange}
          data={[
            { value: 'en', label: 'EN' },
            { value: 'pt', label: 'PT' },
            { value: 'es', label: 'ES' },
          ]}
        />
      </Group>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

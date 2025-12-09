import { useTranslation } from 'react-i18next';
import { Stack, Title, Text, Paper, useMantineTheme, useComputedColorScheme } from '@mantine/core';

const contributors = [
  'Ruan',
  'Vicky',
  'Gustavo Almeida',
  'Fabio Maia',
  'Franco',
];

export function CreditsPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  return (
    <Stack gap="lg" p="md" align="center">
      <Title order={2} style={{ color: isDark ? theme.white : theme.colors.dark[7] }}>
        {t('credits.title')}
      </Title>
      
      <Text size="lg" ta="center" style={{ color: isDark ? theme.colors.gray[4] : theme.colors.gray[7] }}>
        {t('credits.description')}
      </Text>

      <Stack gap="sm" w="100%" maw={400} mt="md">
        {contributors.map((name) => (
          <Paper
            key={name}
            p="md"
            withBorder
            style={{
              backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
              textAlign: 'center',
            }}
          >
            <Text fw={500} size="lg" style={{ color: isDark ? theme.white : theme.colors.dark[7] }}>
              {name}
            </Text>
          </Paper>
        ))}
      </Stack>

      <Text size="sm" mt="xl" ta="center" style={{ color: isDark ? theme.colors.gray[5] : theme.colors.gray[6] }}>
        {t('credits.footer')}
      </Text>
    </Stack>
  );
}

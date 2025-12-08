import { useTranslation } from 'react-i18next';
import { Stack, Paper, Text } from '@mantine/core';

interface Document {
  key: string;
  url: string;
}

const documents: Document[] = [
  { key: 'bwCompendium', url: '#' },
  { key: 'tournamentRules', url: '#' },
  { key: 'attackSteps', url: '#' },
  { key: 'bannedCards', url: '#' },
  { key: 'errata', url: '#' },
  { key: 'promoLegality', url: '#' },
  { key: 'rulebook', url: '#' },
];

export function DocumentsPage() {
  const { t } = useTranslation();

  return (
    <Stack gap="sm" p="md">
      {documents.map((doc) => (
        <Paper
          key={doc.key}
          component="a"
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          p="md"
          withBorder
          style={{
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <Text c="dark" fw={500}>
            {t(`documents.${doc.key}`)}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}

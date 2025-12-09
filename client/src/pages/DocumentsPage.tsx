import { useTranslation } from 'react-i18next';
import { Stack, Paper, Text, useMantineTheme, useComputedColorScheme } from '@mantine/core';

interface Document {
  key: string;
  url: string;
}

const documents: Document[] = [
  { 
    key: 'tournamentRules', 
    url: 'https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-en.pdf' 
  },
  { 
    key: 'penaltyGuidelines', 
    url: 'https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-penalty-guidelines-en.pdf' 
  },
  { 
    key: 'rulebook', 
    url: 'https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/pfl_rulebook_en.pdf' 
  },
  { 
    key: 'bannedCards', 
    url: 'https://www.pokemon.com/us/play-pokemon/about/pokemon-tcg-banned-card-list' 
  },
  { 
    key: 'tcgTournamentHandbook', 
    url: 'https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-tcg-tournament-handbook-en.pdf' 
  },
  { 
    key: 'promoLegality', 
    url: 'https://www.pokemon.com/us/play-pokemon/about/pokemon-tcg-promo-card-legality-status' 
  },
  { 
    key: 'attackSteps', 
    url: 'https://www.judgeball.com/guidebook/tcg/attack-steps/' 
  },
];

export function DocumentsPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';
  const cardBackground = isDark ? theme.colors.dark[6] : theme.white;
  const textColor = isDark ? theme.white : theme.colors.dark[7];

  return (
    <Stack gap="sm" p="md">
      {documents.map((doc) => (
        <Paper
          key={doc.key}
          data-testid="document-card"
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
            backgroundColor: cardBackground,
          }}
        >
          <Text fw={500} data-testid="document-card-text" style={{ color: textColor }}>
            {t(`documents.${doc.key}`)}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}

import { useTranslation } from 'react-i18next';
import { Stack, Paper, Text, Group, Button, SimpleGrid, Box, useMantineTheme, useComputedColorScheme } from '@mantine/core';
import { useState, useEffect } from 'react';

const counterTypes = ['creatures', 'trainer', 'energy'] as const;
type CounterType = typeof counterTypes[number];

const counterColors: Record<CounterType, string> = {
  creatures: '#FBC02D', // yellow
  trainer: '#81C784',
  energy: '#64B5F6',
};

interface CounterState {
  creatures: number;
  trainer: number;
  energy: number;
}

interface Action {
  type: CounterType;
  amount: number;
}

const STORAGE_KEY = 'deckCheck';

function getInitialData(): { counters: CounterState; history: Action[] } {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return {
        counters: data.counters || { creatures: 0, trainer: 0, energy: 0 },
        history: data.history || [],
      };
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
  return { counters: { creatures: 0, trainer: 0, energy: 0 }, history: [] };
}

export function DeckCheckPage() {
  const { t } = useTranslation();
  const [counters, setCounters] = useState<CounterState>(() => getInitialData().counters);
  const [history, setHistory] = useState<Action[]>(() => getInitialData().history);
  const [selectedCounter, setSelectedCounter] = useState<CounterType | null>(null);
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  // Save to localStorage whenever counters or history change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ counters, history }));
  }, [counters, history]);

  const handleIncrement = (type: CounterType, amount: number) => {
    setCounters(prev => ({ ...prev, [type]: prev[type] + amount }));
    setHistory(prev => [...prev, { type, amount }]);
    setSelectedCounter(type);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const lastAction = history[history.length - 1];
    setCounters(prev => ({ ...prev, [lastAction.type]: prev[lastAction.type] - lastAction.amount }));
    setHistory(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    setCounters({ creatures: 0, trainer: 0, energy: 0 });
    setHistory([]);
    setSelectedCounter(null);
  };

  const total = counters.creatures + counters.trainer + counters.energy;

  return (
    <Stack gap="md" p="md">
      <Box data-wizard-counters>
      {counterTypes.map((type) => (
        <Paper
          key={type}
          p="md"
          withBorder
          data-testid={`counter-${type}`}
          data-selected={selectedCounter === type}
          style={{
            backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
            borderLeft: `4px solid ${counterColors[type]}`,
            borderWidth: selectedCounter === type ? '3px' : '1px',
            borderColor: selectedCounter === type ? counterColors[type] : undefined,
          }}
        >
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="lg" style={{ color: isDark ? theme.white : theme.colors.dark[7] }}>
              {t(`deckCheck.${type}`)}
            </Text>
            <Text fw={700} size="xl" data-testid={`counter-${type}-value`} style={{ color: isDark ? theme.white : theme.colors.dark[7] }}>
              {counters[type]}
            </Text>
          </Group>
          <SimpleGrid cols={4} spacing="xs">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant="light"
                color="gray"
                size="md"
                data-testid={`counter-${type}-add-${num}`}
                onClick={() => handleIncrement(type, num)}
              >
                +{num}
              </Button>
            ))}
          </SimpleGrid>
        </Paper>
      ))}
      </Box>

      <Paper
        p="md"
        withBorder
        data-testid="deck-total-card"
        data-wizard-deck-total
        style={{
          backgroundColor: (() => {
            if (total === 60) {
              return isDark ? theme.colors.green[9] : theme.colors.green[0];
            }
            if (total !== 60 && total > 0) {
              return isDark ? theme.colors.red[9] : theme.colors.red[0];
            }
            return isDark ? theme.colors.dark[6] : theme.colors.gray[1];
          })(),
          borderColor: (() => {
            if (total === 60) {
              return theme.colors.green[5];
            }
            if (total !== 60 && total > 0) {
              return theme.colors.red[5];
            }
            return undefined;
          })(),
          borderWidth: (total === 60 || total > 0) ? '2px' : '1px',
        }}
      >
        <Group justify="space-between">
          <Text fw={600} size="lg" data-testid="deck-total-label" style={{ color: isDark ? theme.white : theme.colors.dark[7] }}>
            {t('deckCheck.total')}
          </Text>
          <Text 
            fw={700} 
            size="xl"
            data-testid="deck-total-value"
            style={{
              color: (() => {
                if (total === 60) {
                  return isDark ? theme.colors.green[3] : theme.colors.green[9];
                }
                if (total !== 60 && total > 0) {
                  return isDark ? theme.colors.red[3] : theme.colors.red[9];
                }
                return isDark ? theme.white : theme.colors.dark[7];
              })(),
            }}
          >
            {total}
          </Text>
        </Group>
      </Paper>

      <Box style={{ flexGrow: 1 }} />

      <Group grow gap="sm" data-wizard-deck-controls>
        <Button variant="filled" color="blue" size="lg" onClick={handleUndo}>
          {t('deckCheck.undo')}
        </Button>
        <Button variant="filled" color="orange" size="lg" onClick={handleReset}>
          {t('deckCheck.reset')}
        </Button>
      </Group>

      <Button
        variant="outline"
        color="gray"
        size="lg"
        fullWidth
        component="a"
        href="https://www.pokemon.com/us/pokemon-tcg/pokemon-cards"
        target="_blank"
        rel="noopener noreferrer"
        data-wizard-lookup-card
      >
        {t('deckCheck.lookupCard')}
      </Button>
    </Stack>
  );
}

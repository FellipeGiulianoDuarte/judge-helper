import { useTranslation } from 'react-i18next';
import { Stack, Paper, Text, Group, Button, SimpleGrid, Box } from '@mantine/core';
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

export function DeckCheckPage() {
  const { t } = useTranslation();
  const [counters, setCounters] = useState<CounterState>({ creatures: 0, trainer: 0, energy: 0 });
  const [history, setHistory] = useState<Action[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<CounterType | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setCounters(data.counters || { creatures: 0, trainer: 0, energy: 0 });
        setHistory(data.history || []);
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
  }, []);

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
      {counterTypes.map((type) => (
        <Paper
          key={type}
          p="md"
          withBorder
          data-selected={selectedCounter === type}
          style={{
            borderLeft: `4px solid ${counterColors[type]}`,
            borderWidth: selectedCounter === type ? '3px' : '1px',
            borderColor: selectedCounter === type ? counterColors[type] : undefined,
          }}
        >
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="lg">
              {t(`deckCheck.${type}`)}
            </Text>
            <Text fw={700} size="xl">
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
                onClick={() => handleIncrement(type, num)}
              >
                +{num}
              </Button>
            ))}
          </SimpleGrid>
        </Paper>
      ))}

      <Paper 
        p="md" 
        withBorder 
        bg={total === 60 ? 'green.1' : total > 60 ? 'red.1' : 'gray.1'}
        style={{
          borderColor: total === 60 ? 'var(--mantine-color-green-6)' : total > 60 ? 'var(--mantine-color-red-6)' : undefined,
          borderWidth: total >= 60 ? '2px' : '1px',
        }}
      >
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {t('deckCheck.total')}
          </Text>
          <Text 
            fw={700} 
            size="xl"
            c={total === 60 ? 'green.9' : total > 60 ? 'red.9' : undefined}
          >
            {total}
          </Text>
        </Group>
      </Paper>

      <Box style={{ flexGrow: 1 }} />

      <Group grow gap="sm">
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
      >
        {t('deckCheck.lookupCard')}
      </Button>
    </Stack>
  );
}

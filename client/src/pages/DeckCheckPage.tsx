import { useTranslation } from 'react-i18next';
import { Stack, Paper, Text, Group, Button, SimpleGrid, Box } from '@mantine/core';

const counterTypes = ['creatures', 'trainer', 'energy'] as const;

const counterColors: Record<string, string> = {
  creatures: '#E57373',
  trainer: '#81C784',
  energy: '#64B5F6',
};

export function DeckCheckPage() {
  const { t } = useTranslation();

  return (
    <Stack gap="md" p="md">
      {counterTypes.map((type) => (
        <Paper
          key={type}
          p="md"
          withBorder
          style={{
            borderLeft: `4px solid ${counterColors[type]}`,
          }}
        >
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="lg">
              {t(`deckCheck.${type}`)}
            </Text>
            <Text fw={700} size="xl">
              0
            </Text>
          </Group>
          <SimpleGrid cols={4} spacing="xs">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant="light"
                color="gray"
                size="md"
              >
                +{num}
              </Button>
            ))}
          </SimpleGrid>
        </Paper>
      ))}

      <Paper p="md" withBorder bg="gray.1">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {t('deckCheck.total')}
          </Text>
          <Text fw={700} size="xl">
            0
          </Text>
        </Group>
      </Paper>

      <Box style={{ flexGrow: 1 }} />

      <Group grow gap="sm">
        <Button variant="filled" color="blue" size="lg">
          {t('deckCheck.undo')}
        </Button>
        <Button variant="filled" color="orange" size="lg">
          {t('deckCheck.reset')}
        </Button>
      </Group>

      <Button variant="outline" color="gray" size="lg" fullWidth>
        {t('deckCheck.lookupCard')}
      </Button>
    </Stack>
  );
}

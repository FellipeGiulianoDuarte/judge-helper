import { useState, useEffect } from 'react';
import { Stack, Paper, TextInput, Button, Group, Text, Select, Table, ActionIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface Penalty {
  id: string;
  playerTable: string;
  type: string;
  notes: string;
  timestamp: string;
}

const PENALTY_TYPE_KEYS = ['caution', 'warning', 'prizeCard', 'gameLoss', 'disqualification'] as const;

function loadPenalties(): Penalty[] {
  try {
    const saved = localStorage.getItem('penalties');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export default function PenaltiesPage() {
  const { t } = useTranslation();
  const [penalties, setPenalties] = useState<Penalty[]>(loadPenalties);
  const [playerTable, setPlayerTable] = useState('');
  const [penaltyType, setPenaltyType] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const penaltyTypeOptions = PENALTY_TYPE_KEYS.map((key) => ({
    value: key,
    label: t(`penalties.types.${key}`),
  }));

  // Save to localStorage whenever penalties change
  useEffect(() => {
    localStorage.setItem('penalties', JSON.stringify(penalties));
  }, [penalties]);

  const handleAdd = () => {
    if (!playerTable.trim()) {
      return;
    }

    const newPenalty: Penalty = {
      id: Date.now().toString(),
      playerTable: playerTable.trim(),
      type: penaltyType || 'caution',
      notes: notes.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setPenalties((prev) => [...prev, newPenalty]);
    setPlayerTable('');
    setPenaltyType(null);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    setPenalties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    setPenalties([]);
  };

  return (
    <Stack gap="lg" p="md">
      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            {t('penalties.title')}
          </Text>

          <TextInput
            placeholder={t('penalties.playerTablePlaceholder')}
            value={playerTable}
            onChange={(e) => setPlayerTable(e.target.value)}
          />

          <Select
            label={t('penalties.penaltyType')}
            data={penaltyTypeOptions}
            value={penaltyType}
            onChange={setPenaltyType}
            data-testid="penalty-type-select"
            clearable
          />

          <TextInput
            placeholder={t('penalties.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button onClick={handleAdd} fullWidth>
            {t('penalties.add')}
          </Button>
        </Stack>
      </Paper>

      {penalties.length > 0 && (
        <Button color="red" variant="light" onClick={handleClearAll} fullWidth>
          {t('penalties.clearAll')}
        </Button>
      )}

      <Stack gap="md">
        {penalties.length === 0 ? (
          <Paper shadow="xs" p="md" withBorder>
            <Text ta="center" c="dimmed">
              {t('penalties.noPenalties')}
            </Text>
          </Paper>
        ) : (
          <Paper shadow="xs" p="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('penalties.playerTablePlaceholder')}</Table.Th>
                  <Table.Th>{t('penalties.penaltyType')}</Table.Th>
                  <Table.Th>{t('penalties.notesPlaceholder')}</Table.Th>
                  <Table.Th w={60} style={{ textAlign: 'right' }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {penalties.map((penalty) => (
                  <Table.Tr key={penalty.id}>
                    <Table.Td>{penalty.playerTable}</Table.Td>
                    <Table.Td>{t(`penalties.types.${penalty.type}`)}</Table.Td>
                    <Table.Td>{penalty.notes}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(penalty.id)}
                          aria-label={t('penalties.delete')}
                        >
                          <IconTrash />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}

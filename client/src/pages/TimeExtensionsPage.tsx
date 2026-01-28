import { useState, useEffect, useRef } from 'react';
import { Stack, Paper, TextInput, Button, Group, Text, Table, ActionIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';

// Simple SVG icons
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface TimeExtension {
  id: string;
  round: string;
  table: string;
  minutes: number;
}

export default function TimeExtensionsPage() {
  const { t } = useTranslation();
  const [extensions, setExtensions] = useState<TimeExtension[]>([]);
  const [round, setRound] = useState('');
  const [table, setTable] = useState('');
  const [minutes, setMinutes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState('');
  const isInitialMount = useRef(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('timeExtensions');
    if (saved) {
      setExtensions(JSON.parse(saved));
    }
    isInitialMount.current = false;
  }, []);

  // Save to localStorage (skip initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem('timeExtensions', JSON.stringify(extensions));
    }
  }, [extensions]);

  const handleAdd = () => {
    if (!round.trim() || !table.trim() || !minutes.trim()) {
      return;
    }

    const newExtension: TimeExtension = {
      id: Date.now().toString(),
      round: round.trim(),
      table: table.trim(),
      minutes: parseInt(minutes, 10),
    };

    setExtensions(prev => [...prev, newExtension]);
    setRound('');
    setTable('');
    setMinutes('');
  };

  const handleDelete = (id: string) => {
    setExtensions(prev => prev.filter(ext => ext.id !== id));
  };

  const handleEdit = (ext: TimeExtension) => {
    setEditingId(ext.id);
    setEditMinutes(ext.minutes.toString());
  };

  const handleSave = (id: string) => {
    setExtensions(prev =>
      prev.map(ext =>
        ext.id === id ? { ...ext, minutes: parseInt(editMinutes, 10) } : ext
      )
    );
    setEditingId(null);
    setEditMinutes('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditMinutes('');
  };

  // Group extensions by round
  const groupedExtensions = extensions.reduce((acc, ext) => {
    if (!acc[ext.round]) {
      acc[ext.round] = [];
    }
    acc[ext.round].push(ext);
    return acc;
  }, {} as Record<string, TimeExtension[]>);

  // Sort rounds
  const sortedRounds = Object.keys(groupedExtensions).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  return (
    <Stack gap="lg" p="md">
      <Paper shadow="xs" p="md" withBorder data-wizard-extension-form>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            {t('timeExtensions.title')}
          </Text>

          <Group grow gap="xs">
            <TextInput
              placeholder={t('timeExtensions.roundPlaceholder')}
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
            <TextInput
              placeholder={t('timeExtensions.tablePlaceholder')}
              value={table}
              onChange={(e) => setTable(e.target.value)}
            />
            <TextInput
              placeholder={t('timeExtensions.minutesPlaceholder')}
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </Group>

          <Button onClick={handleAdd} fullWidth>
            {t('timeExtensions.add')}
          </Button>
        </Stack>
      </Paper>

      <Stack gap="md" data-wizard-extension-table>
      {extensions.length === 0 ? (
        <Paper shadow="xs" p="md" withBorder>
          <Text ta="center" c="dimmed">
            {t('timeExtensions.noExtensions')}
          </Text>
        </Paper>
      ) : (
        sortedRounds.map(roundKey => (
          <Paper key={roundKey} shadow="xs" p="md" withBorder>
            <Text size="md" fw={600} mb="sm">
              {t('timeExtensions.round')} {roundKey}
            </Text>
            
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('timeExtensions.table')}</Table.Th>
                  <Table.Th w={100}>{t('timeExtensions.minutes')}</Table.Th>
                  <Table.Th w={100} style={{ textAlign: 'right' }}>{t('timeExtensions.actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {groupedExtensions[roundKey].map(ext => (
                  <Table.Tr key={ext.id}>
                    <Table.Td>{ext.table}</Table.Td>
                    <Table.Td>
                      {editingId === ext.id ? (
                        <TextInput
                          type="number"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(e.target.value)}
                          size="xs"
                          w={80}
                        />
                      ) : (
                        ext.minutes
                      )}
                    </Table.Td>
                    <Table.Td>
                      {editingId === ext.id ? (
                        <Group gap="xs" justify="flex-end">
                          <ActionIcon
                            color="green"
                            variant="light"
                            onClick={() => handleSave(ext.id)}
                            aria-label={t('timeExtensions.save')}
                          >
                            <IconCheck />
                          </ActionIcon>
                          <ActionIcon
                            color="gray"
                            variant="light"
                            onClick={handleCancel}
                            aria-label={t('timeExtensions.cancel')}
                          >
                            <IconX />
                          </ActionIcon>
                        </Group>
                      ) : (
                        <Group gap="xs" justify="flex-end">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={() => handleEdit(ext)}
                            aria-label={t('timeExtensions.edit')}
                          >
                            <IconPencil />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => handleDelete(ext.id)}
                            aria-label={t('timeExtensions.delete')}
                          >
                            <IconTrash />
                          </ActionIcon>
                        </Group>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        ))
      )}
      </Stack>
    </Stack>
  );
}

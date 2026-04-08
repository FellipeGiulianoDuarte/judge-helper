import { useState, useEffect } from 'react';
import { Stack, Paper, TextInput, Button, Group, Text, Select, Textarea, Table, ActionIcon, Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';

// Simple SVG icons
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Infraction categories with their default penalties
interface InfractionDef {
  key: string;
  label: string;
  group: string;
  defaultPenalty: string;
}

const INFRACTIONS: InfractionDef[] = [
  // Gameplay Errors
  { key: 'ge_minor_procedural', label: 'Gameplay Error - Minor: Procedural Error', group: 'Gameplay Errors', defaultPenalty: 'Warning' },
  { key: 'ge_minor_card_effects', label: 'Gameplay Error - Minor: Improper Card Effects', group: 'Gameplay Errors', defaultPenalty: 'Warning' },
  { key: 'ge_major_procedural', label: 'Gameplay Error - Major: Procedural Error', group: 'Gameplay Errors', defaultPenalty: 'Prize Penalty' },
  { key: 'ge_major_card_effects', label: 'Gameplay Error - Major: Improper Card Effects', group: 'Gameplay Errors', defaultPenalty: 'Prize Penalty' },
  { key: 'ge_severe', label: 'Gameplay Error - Severe', group: 'Gameplay Errors', defaultPenalty: 'Game Loss' },
  // Marked Cards
  { key: 'mc_minor', label: 'Marked Cards - Minor', group: 'Marked Cards', defaultPenalty: 'Warning' },
  { key: 'mc_severe', label: 'Marked Cards - Severe', group: 'Marked Cards', defaultPenalty: 'Game Loss' },
  // Deck Errors
  { key: 'de_minor', label: 'Deck Error - Minor', group: 'Deck Errors', defaultPenalty: 'Caution' },
  { key: 'de_major', label: 'Deck Error - Major', group: 'Deck Errors', defaultPenalty: 'Game Loss' },
  { key: 'de_severe', label: 'Deck Error - Severe', group: 'Deck Errors', defaultPenalty: 'Game Loss' },
  // Pace of Play
  { key: 'pop_major', label: 'Pace of Play - Major: Slow Play', group: 'Pace of Play', defaultPenalty: 'Warning' },
  { key: 'pop_severe', label: 'Pace of Play - Severe: Intentional Slow Play', group: 'Pace of Play', defaultPenalty: 'Game Loss' },
  // Tardiness
  { key: 'tard_major', label: 'Tardiness - Major', group: 'Tardiness', defaultPenalty: 'Warning' },
  { key: 'tard_severe', label: 'Tardiness - Severe', group: 'Tardiness', defaultPenalty: 'Game Loss' },
  // Unsporting Conduct
  { key: 'uc_minor', label: 'Unsporting Conduct - Minor', group: 'Unsporting Conduct', defaultPenalty: 'Warning' },
  { key: 'uc_major', label: 'Unsporting Conduct - Major', group: 'Unsporting Conduct', defaultPenalty: 'Game Loss' },
  { key: 'uc_severe', label: 'Unsporting Conduct - Severe', group: 'Unsporting Conduct', defaultPenalty: 'Disqualification' },
  // Cheating
  { key: 'cheating', label: 'Cheating', group: 'Cheating', defaultPenalty: 'Disqualification' },
];

const PENALTY_TIERS = [
  'Caution',
  'Warning',
  'Prize Penalty',
  'Multiple Prize Penalty',
  'Game Loss',
  'Match Loss',
  'Disqualification',
];

interface PenaltyRecord {
  id: string;
  playerName: string;
  round: number;
  infraction: string;
  penaltyApplied: string;
  notes: string;
  timestamp: string;
}

export default function PenaltiesPage() {
  const { t } = useTranslation();
  const [penalties, setPenalties] = useState<PenaltyRecord[]>(() => {
    const saved = localStorage.getItem('penalties');
    return saved ? JSON.parse(saved) : [];
  });
  const [playerName, setPlayerName] = useState('');
  const [round, setRound] = useState('');
  const [selectedInfraction, setSelectedInfraction] = useState<string | null>(null);
  const [penaltyApplied, setPenaltyApplied] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Save to localStorage whenever penalties change
  useEffect(() => {
    localStorage.setItem('penalties', JSON.stringify(penalties));
  }, [penalties]);

  // Auto-fill penalty when infraction changes
  const handleInfractionChange = (value: string | null) => {
    setSelectedInfraction(value);
    if (value) {
      const infraction = INFRACTIONS.find(inf => inf.key === value);
      if (infraction) {
        setPenaltyApplied(infraction.defaultPenalty);
      }
    } else {
      setPenaltyApplied(null);
    }
  };

  const handleAdd = () => {
    if (!playerName.trim() || !round.trim() || !selectedInfraction || !penaltyApplied) {
      return;
    }

    const infraction = INFRACTIONS.find(inf => inf.key === selectedInfraction);
    if (!infraction) return;

    const newPenalty: PenaltyRecord = {
      id: Date.now().toString(),
      playerName: playerName.trim(),
      round: parseInt(round, 10),
      infraction: infraction.label,
      penaltyApplied,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    };

    setPenalties(prev => [...prev, newPenalty]);
    setPlayerName('');
    setRound('');
    setSelectedInfraction(null);
    setPenaltyApplied(null);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    setPenalties(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setPenalties([]);
    setConfirmClearOpen(false);
  };

  const handleExportCsv = () => {
    if (penalties.length === 0) return;

    const escapeCsv = (val: string) => {
      let s = String(val);
      if (/^[=+\-@]/.test(s)) s = `'${s}`;
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const header = [
      t('penalties.round'),
      t('penalties.player'),
      t('penalties.infraction'),
      t('penalties.penaltyApplied'),
    ].join(',');

    const rows = [...penalties]
      .sort((a, b) => a.round - b.round)
      .map(p =>
        [String(p.round), p.playerName, p.infraction, p.penaltyApplied]
          .map(escapeCsv)
          .join(',')
      );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.download = `penalties_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Build grouped select data for infractions
  const infractionSelectData = (() => {
    const groups: Record<string, { value: string; label: string }[]> = {};
    INFRACTIONS.forEach(inf => {
      if (!groups[inf.group]) {
        groups[inf.group] = [];
      }
      groups[inf.group].push({ value: inf.key, label: inf.label });
    });
    return Object.entries(groups).map(([group, items]) => ({
      group,
      items,
    }));
  })();

  const penaltySelectData = PENALTY_TIERS.map(tier => ({
    value: tier,
    label: tier,
  }));

  // Filter penalties by search query
  const filteredPenalties = penalties.filter(p =>
    p.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by player
  const groupedByPlayer: Record<string, PenaltyRecord[]> = {};
  filteredPenalties.forEach(p => {
    const key = p.playerName;
    if (!groupedByPlayer[key]) {
      groupedByPlayer[key] = [];
    }
    groupedByPlayer[key].push(p);
  });

  // Sort players alphabetically
  const sortedPlayers = Object.keys(groupedByPlayer).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <Stack gap="lg" p="md">
      {/* Registration Form */}
      <Paper shadow="xs" p="md" withBorder data-wizard-penalty-form>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            {t('penalties.title')}
          </Text>

          <Text size="xs" c="dimmed" fs="italic">
            {t('documents.penaltyDisclaimer')}
          </Text>

          <TextInput
            placeholder={t('penalties.playerNamePlaceholder')}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />

          <TextInput
            placeholder={t('penalties.roundPlaceholder')}
            type="number"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          />

          <Select
            data-testid="infraction-select"
            label={t('penalties.infractionLabel')}
            placeholder={t('penalties.infractionPlaceholder')}
            data={infractionSelectData}
            value={selectedInfraction}
            onChange={handleInfractionChange}
            searchable
            clearable
          />

          <Select
            data-testid="penalty-select"
            label={t('penalties.penaltyAppliedLabel')}
            placeholder={t('penalties.penaltyAppliedPlaceholder')}
            data={penaltySelectData}
            value={penaltyApplied}
            onChange={setPenaltyApplied}
            searchable
            clearable
          />

          <Textarea
            placeholder={t('penalties.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={2}
          />

          <Button onClick={handleAdd} fullWidth>
            {t('penalties.add')}
          </Button>
        </Stack>
      </Paper>

      {/* Search/Filter */}
      <TextInput
        placeholder={t('penalties.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Export CSV + Clear All (only when there are penalties) */}
      {penalties.length > 0 && (
        <Stack gap="sm">
          <Button
            variant="light"
            leftSection={<IconDownload />}
            onClick={handleExportCsv}
            fullWidth
          >
            {t('penalties.exportCsv')}
          </Button>
          <Button
            variant="outline"
            color="red"
            onClick={() => setConfirmClearOpen(true)}
            fullWidth
          >
            {t('penalties.clearAll')}
          </Button>
        </Stack>
      )}

      {/* Penalty History */}
      <Stack gap="md" data-wizard-penalty-history>
        {filteredPenalties.length === 0 ? (
          <Paper shadow="xs" p="md" withBorder>
            <Text ta="center" c="dimmed">
              {t('penalties.noPenalties')}
            </Text>
          </Paper>
        ) : (
          sortedPlayers.map(playerKey => (
            <Paper key={playerKey} shadow="xs" p="md" withBorder>
              <Text size="md" fw={600} mb="sm">
                {playerKey}
              </Text>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('penalties.round')}</Table.Th>
                    <Table.Th>{t('penalties.infraction')}</Table.Th>
                    <Table.Th>{t('penalties.penaltyApplied')}</Table.Th>
                    <Table.Th>{t('penalties.notes')}</Table.Th>
                    <Table.Th w={60} style={{ textAlign: 'right' }}>{t('penalties.actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {groupedByPlayer[playerKey]
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map(penalty => (
                      <Table.Tr key={penalty.id}>
                        <Table.Td>{penalty.round}</Table.Td>
                        <Table.Td style={{ fontSize: '0.85em' }}>{penalty.infraction}</Table.Td>
                        <Table.Td>{penalty.penaltyApplied}</Table.Td>
                        <Table.Td style={{ fontSize: '0.85em' }}>{penalty.notes || '-'}</Table.Td>
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
          ))
        )}
      </Stack>

      {/* Confirm Clear Modal */}
      <Modal
        opened={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title={t('penalties.confirmClearTitle')}
        centered
      >
        <Text mb="md">{t('penalties.confirmClearMessage')}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmClearOpen(false)}>
            {t('penalties.cancel')}
          </Button>
          <Button color="red" onClick={handleClearAll}>
            {t('penalties.confirm')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}

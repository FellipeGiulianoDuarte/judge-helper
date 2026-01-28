import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Stack,
  Paper,
  Text,
  Group,
  Button,
  Box,
  Checkbox,
  Modal,
  ScrollArea,
  Divider,
  Badge,
  useMantineTheme,
  useComputedColorScheme,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const ONCE_PER_TURN_ACTIONS = ['supporter', 'energy', 'stadium', 'retreat'] as const;
const actionTypes = [...ONCE_PER_TURN_ACTIONS, 'otherAction'] as const;

type ActionType = (typeof actionTypes)[number];

// Helper function para formatar tempo em MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface TurnRecord {
  player: 1 | 2;
  turnNumber: number;
  supporter: number;
  energy: number;
  stadium: number;
  retreat: number;
  otherAction: number;
  draw: boolean;
  prizes: number;
  timerSeconds: number;
}

interface TableJudgeState {
  supporter: number;
  energy: number;
  stadium: number;
  retreat: number;
  otherAction: number;
  draw: boolean;
  prizes: number;
  timerSeconds: number;
  currentPlayer: 1 | 2;
  turnNumber: number;
  turnHistory: TurnRecord[];
  autostartDraw: boolean;
  autostartNextTurn: boolean;
}

const STORAGE_KEY = 'tableJudgeState';

const getInitialState = (): TableJudgeState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        supporter: parsed.supporter ?? 0,
        energy: parsed.energy ?? 0,
        stadium: parsed.stadium ?? 0,
        retreat: parsed.retreat ?? 0,
        otherAction: parsed.otherAction ?? 0,
        draw: parsed.draw ?? false,
        prizes: parsed.prizes ?? 0,
        timerSeconds: parsed.timerSeconds ?? 0,
        currentPlayer: parsed.currentPlayer ?? 1,
        turnNumber: parsed.turnNumber ?? 1,
        turnHistory: parsed.turnHistory ?? [],
        autostartDraw: parsed.autostartDraw ?? false,
        autostartNextTurn: parsed.autostartNextTurn ?? false,
      };
    }
  } catch {
    // ignore parse errors
  }
  return {
    supporter: 0,
    energy: 0,
    stadium: 0,
    retreat: 0,
    otherAction: 0,
    draw: false,
    prizes: 0,
    timerSeconds: 0,
    currentPlayer: 1,
    turnNumber: 1,
    turnHistory: [],
    autostartDraw: false,
    autostartNextTurn: false,
  };
};

export function TableJudgePage() {
  const { t } = useTranslation();
  const [state, setState] = useState<TableJudgeState>(getInitialState);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timerSeconds: prev.timerSeconds + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleActionClick = useCallback((action: ActionType) => {
    const isOncePerTurn = ONCE_PER_TURN_ACTIONS.includes(action as (typeof ONCE_PER_TURN_ACTIONS)[number]);
    
    if (isOncePerTurn && state[action] > 0) {
      return;
    }
    
    setState((prev) => ({
      ...prev,
      [action]: prev[action] + 1,
    }));
  }, [state]);

  const handleActionDecrement = useCallback((action: ActionType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the increment
    
    if (state[action] > 0) {
      setState((prev) => ({
        ...prev,
        [action]: prev[action] - 1,
      }));
    }
  }, [state]);

  const handleStart = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const handleStop = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const handlePrizesClick = useCallback(() => {
    setState((prev) => ({
      ...prev,
      prizes: Math.min(prev.prizes + 1, 6),
    }));
  }, []);

  const handlePrizesDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (state.prizes > 0) {
        setState((prev) => ({
          ...prev,
          prizes: prev.prizes - 1,
        }));
      }
    },
    [state.prizes]
  );

  const handleDrawToggle = useCallback(() => {
    const newDrawState = !state.draw;
    setState((prev) => ({
      ...prev,
      draw: newDrawState,
    }));

    // Autostart timer se a opção estiver ativada e draw foi marcado
    if (newDrawState && state.autostartDraw) {
      setIsTimerRunning(true);
    }
  }, [state.draw, state.autostartDraw]);

  const handleAutostartDrawToggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      autostartDraw: !prev.autostartDraw,
    }));
  }, []);

  const handleAutostartNextTurnToggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      autostartNextTurn: !prev.autostartNextTurn,
    }));
  }, []);

  const handleNextTurn = useCallback(() => {
    setIsTimerRunning(false);

    const turnRecord: TurnRecord = {
      player: state.currentPlayer,
      turnNumber: state.turnNumber,
      supporter: state.supporter,
      energy: state.energy,
      stadium: state.stadium,
      retreat: state.retreat,
      otherAction: state.otherAction,
      draw: state.draw,
      prizes: state.prizes,
      timerSeconds: state.timerSeconds,
    };

    setState((prev) => ({
      supporter: 0,
      energy: 0,
      stadium: 0,
      retreat: 0,
      otherAction: 0,
      draw: false,
      prizes: 0,
      timerSeconds: 0,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
      turnNumber: prev.turnNumber + 1,
      turnHistory: [turnRecord, ...prev.turnHistory],
      autostartDraw: prev.autostartDraw,
      autostartNextTurn: prev.autostartNextTurn,
    }));

    // Autostart timer se a opção estiver ativada
    if (state.autostartNextTurn) {
      setIsTimerRunning(true);
    }
  }, [state]);

  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);

  const handleClearAllClick = useCallback(() => {
    openConfirmModal();
  }, [openConfirmModal]);

  const handleConfirmClearAll = useCallback(() => {
    setIsTimerRunning(false);
    setState((prev) => ({
      supporter: 0,
      energy: 0,
      stadium: 0,
      retreat: 0,
      otherAction: 0,
      draw: false,
      prizes: 0,
      timerSeconds: 0,
      currentPlayer: 1,
      turnNumber: 1,
      turnHistory: [],
      autostartDraw: prev.autostartDraw, // Preservar preferência do usuário
      autostartNextTurn: prev.autostartNextTurn, // Preservar preferência do usuário
    }));
    closeConfirmModal();
  }, [closeConfirmModal]);

  const actionTotal = state.supporter + state.energy + state.stadium + state.retreat + state.otherAction;
  
  const secondsPerAction = actionTotal > 0 ? Math.floor(state.timerSeconds / actionTotal) : 0;

  const actionTotalTextColor = isDark ? theme.white : theme.colors.dark[7];
  const actionTotalCardBg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const paperBg = isDark ? theme.colors.dark[6] : theme.white;
  const dimmedColor = isDark ? theme.colors.gray[4] : theme.colors.gray[6];
  const buttonLabelColor = isDark ? theme.white : theme.colors.dark[6];
  const historyBg = isDark ? theme.colors.dark[7] : theme.colors.gray[1];
  const historyEntryBg = isDark ? theme.colors.dark[6] : theme.white;

  const getButtonColor = (action: ActionType) => {
    const isOncePerTurn = ONCE_PER_TURN_ACTIONS.includes(action as (typeof ONCE_PER_TURN_ACTIONS)[number]);
    if (isOncePerTurn && state[action] > 0) {
      return 'green';
    }
    return 'gray';
  };

  return (
    <Stack gap="md" p="md">
      {/* Draw Checkbox */}
      <Paper
        p="md"
        withBorder
        style={{ backgroundColor: paperBg, cursor: 'pointer' }}
        onClick={handleDrawToggle}
        data-testid="draw-card"
        data-wizard-draw
      >
        <Checkbox
          label={t('tableJudge.draw')}
          checked={state.draw}
          onChange={handleDrawToggle}
          size="lg"
          styles={{
            label: {
              color: buttonLabelColor,
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        />
      </Paper>

      {/* Action Buttons */}
      <Box data-wizard-actions>
      {actionTypes.map((type) => (
        <Group key={type} gap="xs" wrap="nowrap" mb="md">
          <Button
            variant="light"
            color={getButtonColor(type)}
            size="lg"
            style={{ flex: 1 }}
            justify="space-between"
            rightSection={<Text fw={700}>{state[type]}</Text>}
            onClick={() => handleActionClick(type)}
            styles={{
              label: {
                color: buttonLabelColor,
              },
            }}
          >
            {t(`tableJudge.${type}`)}
          </Button>
          <Button
            variant="outline"
            color="red"
            size="lg"
            onClick={(e) => handleActionDecrement(type, e)}
            disabled={state[type] === 0}
            style={{ minWidth: '50px' }}
          >
            −
          </Button>
        </Group>
      ))}
      </Box>

      {/* Prizes Counter */}
      <Group gap="xs" wrap="nowrap" data-wizard-prizes>
        <Button
          variant="light"
          color="yellow"
          size="lg"
          style={{ flex: 1 }}
          justify="space-between"
          rightSection={<Text fw={700}>{state.prizes}</Text>}
          onClick={handlePrizesClick}
          styles={{
            label: {
              color: buttonLabelColor,
            },
          }}
        >
          {t('tableJudge.prizes')}
        </Button>
        <Button
          variant="outline"
          color="red"
          size="lg"
          onClick={handlePrizesDecrement}
          disabled={state.prizes === 0}
          style={{ minWidth: '50px' }}
        >
          −
        </Button>
      </Group>

      {/* Action Total */}
      <Paper p="md" withBorder data-testid="action-total-card" style={{ backgroundColor: actionTotalCardBg }}>
        <Group justify="space-between">
          <Text fw={600} size="lg" data-testid="action-total-label" style={{ color: actionTotalTextColor }}>
            {t('tableJudge.actionTotal')}
          </Text>
          <Text fw={700} size="xl" data-testid="action-total-value" style={{ color: actionTotalTextColor }}>
            {actionTotal}
          </Text>
        </Group>
      </Paper>

      {/* Timer and Pace */}
      <Group grow gap="sm" data-wizard-timer-display>
        <Paper p="md" withBorder style={{ textAlign: 'center', backgroundColor: paperBg }}>
          <Text size="sm" style={{ color: dimmedColor }}>
            {t('tableJudge.time')}
          </Text>
          <Text fw={700} size="2rem" style={{ color: actionTotalTextColor }}>
            {state.timerSeconds}s
          </Text>
        </Paper>
        
        <Paper p="md" withBorder style={{ textAlign: 'center', backgroundColor: paperBg }}>
          <Text size="sm" style={{ color: dimmedColor }}>
            {t('tableJudge.pace')}
          </Text>
          <Text fw={700} size="xl" style={{ color: actionTotalTextColor }}>
            {secondsPerAction}{t('tableJudge.paceUnit')}
          </Text>
        </Paper>
      </Group>

      {/* Timer Controls */}
      <Group grow gap="sm" data-wizard-timer-controls>
        <Button variant="filled" color="green" size="lg" onClick={handleStart}>
          {t('tableJudge.start')}
        </Button>
        <Button variant="filled" color="red" size="lg" onClick={handleStop}>
          {t('tableJudge.stop')}
        </Button>
      </Group>

      {/* Next Turn Button */}
      <Button variant="filled" color="blue" size="xl" fullWidth onClick={handleNextTurn} data-wizard-next-turn>
        {t('tableJudge.nextTurn')}
      </Button>

      {/* Turn History */}
      <Paper p="md" withBorder data-testid="turn-history" style={{ backgroundColor: historyBg }} data-wizard-turn-history>
        <Text fw={600} size="lg" mb="sm" style={{ color: actionTotalTextColor }}>
          {t('tableJudge.turnHistory')}
        </Text>

        {state.turnHistory.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {t('tableJudge.noHistory')}
          </Text>
        ) : (
          <ScrollArea.Autosize mah={250}>
            <Stack gap="xs">
              {state.turnHistory.map((turn, index) => (
                <Paper
                  key={index}
                  p="sm"
                  withBorder
                  data-testid="turn-entry"
                  style={{ backgroundColor: historyEntryBg }}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge color={turn.player === 1 ? 'blue' : 'orange'} size="lg">
                        {turn.player === 1 ? t('tableJudge.player1') : t('tableJudge.player2')}
                      </Badge>
                      <Text size="xs" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⏱️</span>
                        {formatTime(turn.timerSeconds)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {(() => {
                          const totalActions = turn.supporter + turn.energy + turn.stadium + turn.retreat + turn.otherAction;
                          return totalActions > 0 
                            ? `(${Math.round(turn.timerSeconds / totalActions)}s/act)` 
                            : '(0s/act)';
                        })()}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {t('tableJudge.turn')} {turn.turnNumber}
                    </Text>
                  </Group>
                  <Divider mb="xs" />
                  <Group gap="xs" wrap="wrap">
                    {turn.draw && (
                      <Badge variant="light" color="teal" size="sm">
                        {t('tableJudge.draw')} ✓
                      </Badge>
                    )}
                    {turn.supporter > 0 && (
                      <Badge variant="light" color="violet" size="sm">
                        {t('tableJudge.supporter')}: {turn.supporter}
                      </Badge>
                    )}
                    {turn.energy > 0 && (
                      <Badge variant="light" color="yellow" size="sm">
                        {t('tableJudge.energy')}: {turn.energy}
                      </Badge>
                    )}
                    {turn.stadium > 0 && (
                      <Badge variant="light" color="cyan" size="sm">
                        {t('tableJudge.stadium')}: {turn.stadium}
                      </Badge>
                    )}
                    {turn.retreat > 0 && (
                      <Badge variant="light" color="gray" size="sm">
                        {t('tableJudge.retreat')}: {turn.retreat}
                      </Badge>
                    )}
                    {turn.otherAction > 0 && (
                      <Badge variant="light" color="pink" size="sm">
                        {t('tableJudge.otherAction')}: {turn.otherAction}
                      </Badge>
                    )}
                    {turn.prizes > 0 && (
                      <Badge variant="light" color="red" size="sm">
                        {t('tableJudge.prizes')}: {turn.prizes}
                      </Badge>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Paper>

      <Box style={{ flexGrow: 1 }} />

      {/* Clear All Button */}
      <Button variant="filled" color="orange" size="xl" fullWidth onClick={handleClearAllClick} data-wizard-clear-all>
        {t('tableJudge.clearAll')}
      </Button>

      {/* Autostart Switches */}
      <Paper
        p="xs"
        withBorder
        data-testid="autostart-switches-container"
        data-wizard-autostart
        style={{
          backgroundColor: paperBg,
          opacity: 0.85,
        }}
      >
        <Stack gap="xs">
          <Switch
            label={t('tableJudge.autostartDraw')}
            checked={state.autostartDraw}
            onChange={handleAutostartDrawToggle}
            size="sm"
            data-testid="autostart-draw-switch"
            styles={{
              label: {
                color: dimmedColor,
                fontSize: '0.8rem',
              },
            }}
          />
          <Switch
            label={t('tableJudge.autostartNextTurn')}
            checked={state.autostartNextTurn}
            onChange={handleAutostartNextTurnToggle}
            size="sm"
            data-testid="autostart-next-turn-switch"
            styles={{
              label: {
                color: dimmedColor,
                fontSize: '0.8rem',
              },
            }}
          />
        </Stack>
      </Paper>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title={t('tableJudge.confirmClearTitle')}
        centered
        size="sm"
      >
        <Text mb="lg">{t('tableJudge.confirmClearMessage')}</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={closeConfirmModal}>
            {t('tableJudge.cancel')}
          </Button>
          <Button color="red" onClick={handleConfirmClearAll}>
            {t('tableJudge.confirm')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}

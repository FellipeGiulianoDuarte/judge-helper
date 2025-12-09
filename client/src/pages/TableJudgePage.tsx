import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Stack, Paper, Text, Group, Button, Box, useMantineTheme, useComputedColorScheme } from '@mantine/core';

const ONCE_PER_TURN_ACTIONS = ['supporter', 'energy', 'stadium', 'retreat'] as const;
const actionTypes = [...ONCE_PER_TURN_ACTIONS, 'otherAction'] as const;

type ActionType = (typeof actionTypes)[number];

interface TableJudgeState {
  supporter: number;
  energy: number;
  stadium: number;
  retreat: number;
  otherAction: number;
  timerSeconds: number;
}

const STORAGE_KEY = 'tableJudgeState';

const getInitialState = (): TableJudgeState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
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
    timerSeconds: 0,
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

  const handleNextTurn = useCallback(() => {
    setIsTimerRunning(false);
    setState({
      supporter: 0,
      energy: 0,
      stadium: 0,
      retreat: 0,
      otherAction: 0,
      timerSeconds: 0,
    });
  }, []);

  const actionTotal = state.supporter + state.energy + state.stadium + state.retreat + state.otherAction;
  
  const secondsPerAction = actionTotal > 0 ? Math.floor(state.timerSeconds / actionTotal) : 0;

  const actionTotalTextColor = isDark ? theme.white : theme.colors.dark[7];
  const actionTotalCardBg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const paperBg = isDark ? theme.colors.dark[6] : theme.white;
  const dimmedColor = isDark ? theme.colors.gray[4] : theme.colors.gray[6];
  const buttonLabelColor = isDark ? theme.white : theme.colors.dark[6];

  const getButtonColor = (action: ActionType) => {
    const isOncePerTurn = ONCE_PER_TURN_ACTIONS.includes(action as (typeof ONCE_PER_TURN_ACTIONS)[number]);
    if (isOncePerTurn && state[action] > 0) {
      return 'green';
    }
    return 'gray';
  };

  return (
    <Stack gap="md" p="md">
      {actionTypes.map((type) => (
        <Group key={type} gap="xs" wrap="nowrap">
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

      <Group grow gap="sm">
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

      <Group grow gap="sm">
        <Button variant="filled" color="green" size="lg" onClick={handleStart}>
          {t('tableJudge.start')}
        </Button>
        <Button variant="filled" color="red" size="lg" onClick={handleStop}>
          {t('tableJudge.stop')}
        </Button>
      </Group>

      <Box style={{ flexGrow: 1 }} />

      <Button variant="filled" color="orange" size="xl" fullWidth onClick={handleNextTurn}>
        {t('tableJudge.clearAll')}
      </Button>
    </Stack>
  );
}

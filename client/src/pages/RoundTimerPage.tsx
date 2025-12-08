import { useState, useEffect, useRef, useCallback } from 'react';
import { Stack, Paper, TextInput, Button, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface TimerState {
  roundName: string;
  totalSeconds: number;
  // When running: secondsAtStart - elapsed time since startTimestamp
  // When paused: the actual remaining seconds
  remainingSeconds: number;
  isRunning: boolean;
  // Timestamp when timer was started (null if paused)
  startTimestamp: number | null;
  // Seconds remaining when timer was started
  secondsAtStart: number;
}

const PRESETS = {
  BO1: 30,
  BO3: 50,
  TOP_CUT: 75,
};

export default function RoundTimerPage() {
  const { t } = useTranslation();
  const [customMinutes, setCustomMinutes] = useState('');
  const [state, setState] = useState<TimerState>({
    roundName: '',
    totalSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    startTimestamp: null,
    secondsAtStart: 0,
  });
  
  const intervalRef = useRef<number | null>(null);

  // Calculate current remaining seconds based on timestamp
  const calculateRemainingSeconds = useCallback((timerState: TimerState): number => {
    if (timerState.isRunning && timerState.startTimestamp) {
      const elapsedSeconds = Math.floor((Date.now() - timerState.startTimestamp) / 1000);
      return timerState.secondsAtStart - elapsedSeconds;
    }
    return timerState.remainingSeconds;
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('roundTimer');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Calculate current remaining seconds if timer was running
      const currentRemaining = calculateRemainingSeconds(parsed);
      
      setState({
        ...parsed,
        remainingSeconds: currentRemaining,
        // Keep running if it was running!
        isRunning: parsed.isRunning,
      });
    }
  }, [calculateRemainingSeconds]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.totalSeconds > 0 || state.roundName) {
      const toSave = {
        roundName: state.roundName,
        totalSeconds: state.totalSeconds,
        remainingSeconds: state.remainingSeconds,
        isRunning: state.isRunning,
        startTimestamp: state.startTimestamp,
        secondsAtStart: state.secondsAtStart,
      };
      localStorage.setItem('roundTimer', JSON.stringify(toSave));
    }
  }, [state]);

  // Timer interval - just update display based on timestamp
  useEffect(() => {
    if (state.isRunning && state.startTimestamp) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          remainingSeconds: calculateRemainingSeconds(prev),
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.startTimestamp, calculateRemainingSeconds]);

  const setPreset = (minutes: number) => {
    setState(prev => ({
      ...prev,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: false,
      startTimestamp: null,
      secondsAtStart: minutes * 60,
    }));
  };

  const setCustomTime = () => {
    const minutes = parseFloat(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      const seconds = Math.floor(minutes * 60);
      setState(prev => ({
        ...prev,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: false,
        startTimestamp: null,
        secondsAtStart: seconds,
      }));
      setCustomMinutes('');
    }
  };

  const handleStart = () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startTimestamp: Date.now(),
      secondsAtStart: prev.remainingSeconds,
    }));
  };

  const handlePause = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      remainingSeconds: calculateRemainingSeconds(prev),
      startTimestamp: null,
    }));
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      remainingSeconds: prev.totalSeconds,
      isRunning: false,
      startTimestamp: null,
      secondsAtStart: prev.totalSeconds,
    }));
  };

  const formatTime = (seconds: number): string => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  const getTimerColor = (): string => {
    if (state.remainingSeconds <= 0) {
      return '#fa5252'; // red
    }
    const oneThirdTime = state.totalSeconds / 3;
    if (state.remainingSeconds <= oneThirdTime) {
      return '#fab005'; // yellow
    }
    return '#40c057'; // green
  };

  const isOvertime = state.remainingSeconds < 0;

  return (
    <Stack gap="lg" p="md">
      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <TextInput
            placeholder={t('roundTimer.roundNamePlaceholder')}
            value={state.roundName}
            onChange={(e) => setState(prev => ({ ...prev, roundName: e.target.value }))}
            size="lg"
          />

          {state.roundName && (
            <Text size="xl" fw={700} ta="center">
              {state.roundName}
            </Text>
          )}

          <Text size="6rem" fw={700} ta="center" style={{ color: getTimerColor() }}>
            {formatTime(state.remainingSeconds)}
          </Text>

          {isOvertime && (
            <Text size="xl" fw={700} ta="center" c="red">
              {t('roundTimer.overtime')}
            </Text>
          )}

          <Group grow gap="xs">
            <Button onClick={handleStart} color="green" disabled={state.isRunning || state.totalSeconds === 0}>
              {t('roundTimer.start')}
            </Button>
            <Button onClick={handlePause} color="yellow" disabled={!state.isRunning}>
              {t('roundTimer.pause')}
            </Button>
            <Button onClick={handleReset} color="gray" disabled={state.totalSeconds === 0}>
              {t('roundTimer.reset')}
            </Button>
          </Group>

          {state.totalSeconds > 0 && (
            <Button 
              onClick={() => window.open('/round-timer-display', '_blank')}
              variant="filled"
              color="blue"
              size="lg"
            >
              {t('roundTimer.startDisplay')}
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            {t('roundTimer.presets')}
          </Text>

          <Group grow gap="xs">
            <Button onClick={() => setPreset(PRESETS.BO1)} variant="light">
              BO1 - 30min
            </Button>
            <Button onClick={() => setPreset(PRESETS.BO3)} variant="light">
              BO3 - 50min
            </Button>
            <Button onClick={() => setPreset(PRESETS.TOP_CUT)} variant="light">
              Top Cut - 75min
            </Button>
          </Group>

          <Group grow gap="xs">
            <TextInput
              placeholder={t('roundTimer.customMinutes')}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              type="number"
              step="0.01"
            />
            <Button onClick={setCustomTime} variant="filled">
              {t('roundTimer.set')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

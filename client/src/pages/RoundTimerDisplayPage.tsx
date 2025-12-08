import { useState, useEffect, useRef, useCallback } from 'react';
import { Stack, Button, Group, Text, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface TimerState {
  roundName: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startTimestamp: number | null;
  secondsAtStart: number;
}

export default function RoundTimerDisplayPage() {
  const { t } = useTranslation();
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

  // Calculate angle for pie chart (0-360 degrees)
  const getCircleAngle = (): number => {
    if (state.totalSeconds === 0) return 360;
    
    if (state.remainingSeconds >= 0) {
      // Normal countdown: 360 to 0 degrees
      return (state.remainingSeconds / state.totalSeconds) * 360;
    } else {
      // Overtime: grow from 0 based on overtime duration
      const overtimeSeconds = Math.abs(state.remainingSeconds);
      const overtimeProgress = Math.min((overtimeSeconds / state.totalSeconds), 1);
      return overtimeProgress * 360;
    }
  };

  const isOvertime = state.remainingSeconds < 0;
  const circleAngle = getCircleAngle();
  
  // Create pie chart arc path
  const createArcPath = (angle: number, radius: number, cx: number, cy: number): string => {
    if (angle >= 360) {
      // Full circle
      return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`;
    }
    if (angle <= 0) {
      return '';
    }
    
    const startAngle = -90; // Start from top
    const endAngle = startAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#ffffff',
        padding: '2rem'
      }}
    >
      <Stack gap="xl" align="center" style={{ width: '100%', maxWidth: '600px' }}>
        {state.roundName && (
          <Text size="2.5rem" fw={700} ta="center" c="dark">
            {state.roundName}
          </Text>
        )}

        <Box style={{ position: 'relative', width: '350px', height: '350px' }}>
          {/* SVG Pie Chart */}
          <svg width="350" height="350" viewBox="0 0 350 350">
            {/* Background circle (gray) */}
            <circle
              cx="175"
              cy="175"
              r="160"
              fill="#e9ecef"
            />
            
            {/* Filled pie chart that depletes */}
            <path
              d={createArcPath(circleAngle, 160, 175, 175)}
              fill={getTimerColor()}
              style={{
                transition: 'fill 0.3s ease',
              }}
            />
            
            {/* Inner white circle to create thin ring effect */}
            <circle
              cx="175"
              cy="175"
              r="140"
              fill="#ffffff"
            />
          </svg>

          {/* Timer text overlay */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Text size="4rem" fw={700} style={{ color: getTimerColor() }}>
              {formatTime(state.remainingSeconds)}
            </Text>
            
            {isOvertime && (
              <Text size="1.5rem" fw={700} c="red">
                {t('roundTimer.overtime')}
              </Text>
            )}
          </Box>
        </Box>

        <Group gap="md">
          <Button 
            onClick={handleStart} 
            color="green" 
            disabled={state.isRunning || state.totalSeconds === 0}
            size="xl"
          >
            {t('roundTimer.start')}
          </Button>
          <Button 
            onClick={handlePause} 
            color="yellow" 
            disabled={!state.isRunning}
            size="xl"
          >
            {t('roundTimer.pause')}
          </Button>
          <Button 
            onClick={handleReset} 
            color="gray" 
            disabled={state.totalSeconds === 0}
            size="xl"
          >
            {t('roundTimer.reset')}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import introJs from 'intro.js';
import { wizardSteps, TOTAL_STEPS } from './wizardSteps';
import 'intro.js/introjs.css';
import './wizardStyles.css';

const STORAGE_KEY = 'onboardingCompleted';

interface OnboardingWizardContextType {
  startWizard: () => void;
  isWizardActive: boolean;
}

const OnboardingWizardContext = createContext<OnboardingWizardContextType | null>(null);

export function useOnboardingWizard() {
  const context = useContext(OnboardingWizardContext);
  if (!context) {
    throw new Error('useOnboardingWizard must be used within OnboardingWizardProvider');
  }
  return context;
}

interface OnboardingWizardProviderProps {
  children: React.ReactNode;
}

export function OnboardingWizardProvider({ children }: OnboardingWizardProviderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const introRef = useRef<any>(null);
  const [isWizardActive, setIsWizardActive] = useState(false);
  const hasAutoStarted = useRef(false);
  const pendingStepRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const locationRef = useRef(location.pathname);
  const navigateRef = useRef(navigate);
  const targetStepRef = useRef<number | null>(null); // Used to skip onchange during goToStep

  // Keep refs updated
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const isCompleted = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }, []);

  const markCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const buildSteps = useCallback(() => {
    return wizardSteps.map((step, index) => ({
      element: step.element,
      title: t(step.titleKey),
      intro: `
        <div class="wizard-content">
          <p>${t(step.descriptionKey)}</p>
          <div class="wizard-progress">
            ${t('onboarding.stepOf', { current: index + 1, total: TOTAL_STEPS })}
          </div>
        </div>
      `,
      position: step.position === 'auto' ? undefined : step.position,
    }));
  }, [t]);

  const startIntroAtStep = useCallback((stepIndex: number) => {
    // Clean up previous instance
    if (introRef.current) {
      try {
        introRef.current.exit(true);
      } catch {
        // ignore
      }
      introRef.current = null;
    }

    // Verify the step's target tab matches current path
    const step = wizardSteps[stepIndex];
    if (step?.targetTab && step.targetTab !== locationRef.current) {
      // Need to navigate first
      isNavigatingRef.current = true;
      pendingStepRef.current = stepIndex;
      navigateRef.current(step.targetTab);
      return;
    }

    const intro = introJs();
    introRef.current = intro;

    intro.setOptions({
      steps: buildSteps(),
      showProgress: true,
      showBullets: false,
      showStepNumbers: false,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      scrollToElement: true,
      scrollPadding: 80,
      nextLabel: t('onboarding.next'),
      prevLabel: t('onboarding.previous'),
      skipLabel: t('onboarding.skip'),
      doneLabel: t('onboarding.done'),
    });

    // Use onchange to detect when we land on a step that requires navigation
    intro.onchange(function () {
      // Get current step from intro.js internal state
      const currentStep = intro.getCurrentStep();
      if (currentStep === undefined) return;

      // If we're navigating to a target step, skip the check until we reach it
      if (targetStepRef.current !== null) {
        if (currentStep === targetStepRef.current) {
          // Reached target step, clear the flag
          targetStepRef.current = null;
        }
        // Skip navigation check while moving to target step
        return;
      }

      const stepConfig = wizardSteps[currentStep];
      if (!stepConfig || !stepConfig.targetTab) return;

      // Check if we need to navigate (use ref for current location)
      if (stepConfig.targetTab !== locationRef.current && !isNavigatingRef.current) {
        isNavigatingRef.current = true;
        pendingStepRef.current = currentStep;

        // Exit intro and navigate
        setTimeout(() => {
          try {
            intro.exit(true);
          } catch {
            // ignore
          }
          navigateRef.current(stepConfig.targetTab);
        }, 50);
      }
    });

    intro.oncomplete(() => {
      markCompleted();
      setIsWizardActive(false);
      introRef.current = null;
    });

    intro.onexit(() => {
      // Only mark as inactive if we're not navigating to a new tab
      if (!isNavigatingRef.current) {
        setIsWizardActive(false);
      }
      introRef.current = null;
    });

    // Set target step before starting (to skip onchange checks during navigation)
    if (stepIndex > 0) {
      targetStepRef.current = stepIndex;
    }

    intro.start();

    // Navigate to the correct step after starting
    if (stepIndex > 0) {
      setTimeout(() => {
        if (introRef.current) {
          introRef.current.goToStep(stepIndex + 1); // intro.js is 1-indexed
        }
      }, 100);
    }
  }, [buildSteps, t, markCompleted]);

  const startWizard = useCallback(() => {
    pendingStepRef.current = null;
    isNavigatingRef.current = false;
    targetStepRef.current = null;
    setIsWizardActive(true);

    // Navigate to first step's tab if needed
    const firstStep = wizardSteps[0];
    if (firstStep.targetTab && location.pathname !== firstStep.targetTab) {
      isNavigatingRef.current = true;
      pendingStepRef.current = 0;
      navigate(firstStep.targetTab);
      return;
    }

    // Start immediately if already on correct tab
    setTimeout(() => {
      startIntroAtStep(0);
    }, 300);
  }, [navigate, location.pathname, startIntroAtStep]);

  // Handle navigation completion - restart wizard at pending step
  useEffect(() => {
    if (isWizardActive && pendingStepRef.current !== null && isNavigatingRef.current) {
      const step = wizardSteps[pendingStepRef.current];
      if (step?.targetTab === location.pathname) {
        const stepToStart = pendingStepRef.current;
        pendingStepRef.current = null;
        isNavigatingRef.current = false;
        // Wait for DOM to update
        setTimeout(() => {
          startIntroAtStep(stepToStart);
        }, 400);
      }
    }
  }, [location.pathname, isWizardActive, startIntroAtStep]);

  // Auto-start on first visit
  useEffect(() => {
    if (!hasAutoStarted.current && !isCompleted()) {
      hasAutoStarted.current = true;
      const timer = setTimeout(() => {
        startWizard();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, startWizard]);

  return (
    <OnboardingWizardContext.Provider value={{ startWizard, isWizardActive }}>
      {children}
    </OnboardingWizardContext.Provider>
  );
}

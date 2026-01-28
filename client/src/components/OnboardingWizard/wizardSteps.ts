export interface WizardStep {
  element: string;
  titleKey: string;
  descriptionKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  targetTab?: string;
}

export const wizardSteps: WizardStep[] = [
  // === GLOBAL (Header) - 3 steps ===
  {
    element: '[data-wizard-tabs]',
    titleKey: 'onboarding.steps.tabs.title',
    descriptionKey: 'onboarding.steps.tabs.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-theme]',
    titleKey: 'onboarding.steps.theme.title',
    descriptionKey: 'onboarding.steps.theme.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-language]',
    titleKey: 'onboarding.steps.language.title',
    descriptionKey: 'onboarding.steps.language.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },

  // === TABLE JUDGE - 9 steps ===
  {
    element: '[data-wizard-draw]',
    titleKey: 'onboarding.steps.draw.title',
    descriptionKey: 'onboarding.steps.draw.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-actions]',
    titleKey: 'onboarding.steps.actions.title',
    descriptionKey: 'onboarding.steps.actions.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-prizes]',
    titleKey: 'onboarding.steps.prizes.title',
    descriptionKey: 'onboarding.steps.prizes.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-timer-display]',
    titleKey: 'onboarding.steps.timerDisplay.title',
    descriptionKey: 'onboarding.steps.timerDisplay.description',
    targetTab: '/table-judge',
    position: 'bottom',
  },
  {
    element: '[data-wizard-timer-controls]',
    titleKey: 'onboarding.steps.timerControls.title',
    descriptionKey: 'onboarding.steps.timerControls.description',
    targetTab: '/table-judge',
    position: 'top',
  },
  {
    element: '[data-wizard-next-turn]',
    titleKey: 'onboarding.steps.nextTurn.title',
    descriptionKey: 'onboarding.steps.nextTurn.description',
    targetTab: '/table-judge',
    position: 'top',
  },
  {
    element: '[data-wizard-turn-history]',
    titleKey: 'onboarding.steps.turnHistory.title',
    descriptionKey: 'onboarding.steps.turnHistory.description',
    targetTab: '/table-judge',
    position: 'top',
  },
  {
    element: '[data-wizard-clear-all]',
    titleKey: 'onboarding.steps.clearAll.title',
    descriptionKey: 'onboarding.steps.clearAll.description',
    targetTab: '/table-judge',
    position: 'top',
  },
  {
    element: '[data-wizard-autostart]',
    titleKey: 'onboarding.steps.autostart.title',
    descriptionKey: 'onboarding.steps.autostart.description',
    targetTab: '/table-judge',
    position: 'top',
  },

  // === DECK CHECK - 4 steps ===
  {
    element: '[data-wizard-counters]',
    titleKey: 'onboarding.steps.counters.title',
    descriptionKey: 'onboarding.steps.counters.description',
    targetTab: '/deck-check',
    position: 'bottom',
  },
  {
    element: '[data-wizard-deck-total]',
    titleKey: 'onboarding.steps.deckTotal.title',
    descriptionKey: 'onboarding.steps.deckTotal.description',
    targetTab: '/deck-check',
    position: 'top',
  },
  {
    element: '[data-wizard-deck-controls]',
    titleKey: 'onboarding.steps.deckControls.title',
    descriptionKey: 'onboarding.steps.deckControls.description',
    targetTab: '/deck-check',
    position: 'top',
  },
  {
    element: '[data-wizard-lookup-card]',
    titleKey: 'onboarding.steps.lookupCard.title',
    descriptionKey: 'onboarding.steps.lookupCard.description',
    targetTab: '/deck-check',
    position: 'top',
  },

  // === ROUND TIMER - 5 steps ===
  {
    element: '[data-wizard-round-name]',
    titleKey: 'onboarding.steps.roundName.title',
    descriptionKey: 'onboarding.steps.roundName.description',
    targetTab: '/round-timer',
    position: 'bottom',
  },
  {
    element: '[data-wizard-round-timer-display]',
    titleKey: 'onboarding.steps.roundTimerDisplay.title',
    descriptionKey: 'onboarding.steps.roundTimerDisplay.description',
    targetTab: '/round-timer',
    position: 'bottom',
  },
  {
    element: '[data-wizard-presets]',
    titleKey: 'onboarding.steps.presets.title',
    descriptionKey: 'onboarding.steps.presets.description',
    targetTab: '/round-timer',
    position: 'top',
  },
  {
    element: '[data-wizard-round-controls]',
    titleKey: 'onboarding.steps.roundControls.title',
    descriptionKey: 'onboarding.steps.roundControls.description',
    targetTab: '/round-timer',
    position: 'top',
  },

  // === TIME EXTENSIONS - 2 steps ===
  {
    element: '[data-wizard-extension-form]',
    titleKey: 'onboarding.steps.extensionForm.title',
    descriptionKey: 'onboarding.steps.extensionForm.description',
    targetTab: '/time-extensions',
    position: 'bottom',
  },
  {
    element: '[data-wizard-extension-table]',
    titleKey: 'onboarding.steps.extensionTable.title',
    descriptionKey: 'onboarding.steps.extensionTable.description',
    targetTab: '/time-extensions',
    position: 'top',
  },

  // === DOCUMENTS - 1 step ===
  {
    element: '[data-wizard-documents]',
    titleKey: 'onboarding.steps.documents.title',
    descriptionKey: 'onboarding.steps.documents.description',
    targetTab: '/docs',
    position: 'bottom',
  },
];

export const TOTAL_STEPS = wizardSteps.length;

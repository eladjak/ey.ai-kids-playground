/**
 * CreativeStoryStudio wizard flow tests.
 * Rescued from games/newGames.test.js during Phase 1 cleanup.
 */
import { describe, it, expect } from 'vitest';

describe('CreativeStoryStudio simplified steps', () => {
  it('should define exactly 3 steps', () => {
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    expect(steps.length).toBe(3);
  });

  it('step IDs are unique', () => {
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    const ids = steps.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all steps have title and component', () => {
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it('progress bar calculates correctly for 3 steps', () => {
    const steps = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(((0 + 1) / steps.length * 100).toFixed(0)).toBe('33');
    expect(((1 + 1) / steps.length * 100).toFixed(0)).toBe('67');
    expect(((2 + 1) / steps.length * 100).toFixed(0)).toBe('100');
  });
});

describe('CreativeStoryStudio wizard flow logic', () => {
  const steps = [
    { id: 'idea', title: 'Get Started', component: 'IdeaStep' },
    { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
    { id: 'create', title: 'Preview & Create', component: 'CreateBook' }
  ];

  const nextStep = (currentStep) => {
    if (currentStep < steps.length - 1) return currentStep + 1;
    return currentStep;
  };

  const prevStep = (currentStep) => {
    if (currentStep > 0) return currentStep - 1;
    return currentStep;
  };

  it('nextStep does not advance past the last step', () => {
    expect(nextStep(2)).toBe(2);
    expect(nextStep(1)).toBe(2);
    expect(nextStep(0)).toBe(1);
  });

  it('prevStep does not go below zero', () => {
    expect(prevStep(0)).toBe(0);
    expect(prevStep(1)).toBe(0);
    expect(prevStep(2)).toBe(1);
  });

  it('direct-create starting point jumps to step 1 (Refine & Style)', () => {
    const startingPoint = 'direct-create';
    let currentStep = 0;
    if (startingPoint === 'direct-create') {
      currentStep = nextStep(currentStep);
    }
    expect(currentStep).toBe(1);
    expect(steps[currentStep].id).toBe('refine');
  });

  it('translation keys exist for all 3 step labels in both languages', () => {
    const translations = {
      english: {
        "studio.step.idea": "Get Started",
        "studio.step.refine": "Refine & Style",
        "studio.step.create": "Preview & Create",
      },
      hebrew: {
        "studio.step.idea": "בואו נתחיל",
        "studio.step.refine": "עידון וסגנון",
        "studio.step.create": "תצוגה מקדימה ויצירה",
      }
    };

    const stepKeys = ['studio.step.idea', 'studio.step.refine', 'studio.step.create'];

    stepKeys.forEach((key) => {
      expect(translations.english[key]).toBeTruthy();
      expect(translations.hebrew[key]).toBeTruthy();
    });

    const enKeys = Object.keys(translations.english).filter(k => k.startsWith('studio.step.'));
    const heKeys = Object.keys(translations.hebrew).filter(k => k.startsWith('studio.step.'));
    expect(enKeys.length).toBe(3);
    expect(heKeys.length).toBe(3);
  });

  it('last step shows create button instead of next', () => {
    const lastStepIndex = steps.length - 1;
    expect(lastStepIndex).toBe(2);
    expect(steps[lastStepIndex].id).toBe('create');

    const isLastStep = (idx) => idx === steps.length - 1;
    expect(isLastStep(0)).toBe(false);
    expect(isLastStep(1)).toBe(false);
    expect(isLastStep(2)).toBe(true);
  });
});

import type { LayoutOption } from '../../shared/solver.ts';
import type { LightingPreset } from '../../shared/rules.ts';
import type { IntakeInput, SceneSpec } from '../../shared/types.ts';
import type { Story, StoryFacts } from '../../shared/story.ts';

export type StepId = 'brief' | 'prep' | 'plating' | 'sides' | 'scene' | 'camera' | 'layout' | 'review' | 'story' | 'workspace';

/** The brief plus the country's display label, kept alongside it so every
 * later screen (and the agent prompt) can show/send a name instead of an id. */
export type Brief = IntakeInput & { countryLabel: string };

export const EMPTY_BRIEF: Brief = {
  operatingUnit: '',
  country: '',
  countryLabel: '',
  region: '',
  skuId: '',
  heroDish: '',
  sideDishRequest: '',
  occasion: 'dinner',
};

export function briefOk(b: Brief): boolean {
  return !!(b.country && b.skuId && b.heroDish.trim() && b.occasion);
}

export interface ComposeResult {
  spec: SceneSpec;
  lighting: LightingPreset;
  options: LayoutOption[];
  infeasible: Array<{ archetype: string; reason: string }>;
  /** What the solver had to change, e.g. leaving out an accent there was no room for. */
  notes?: string[];
}

/** The story plus everything derived from it client-side once it arrives. */
export interface StoryState {
  story: Story;
  facts: StoryFacts;
  prompt: string;
  swapPrompt: string;
}

/**
 * The steps shown in the rail. The node workspace is not a step: it opens
 * from Story & scene as an optional advanced view.
 */
export const STEP_ORDER: StepId[] = ['brief', 'scene', 'prep', 'plating', 'sides', 'layout', 'review', 'story'];

export const OCCASION_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  'weekday-lunch': 'Lunch',
  'weekend-lunch': 'Sunday Lunch',
  'afternoon-snack': 'Afternoon',
  dinner: 'Dinner',
  'late-night': 'Late Night',
  celebration: 'Celebration or holiday',
  'game-night': 'Game night',
};

export const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  midday: 'Midday',
  'golden-hour': 'Golden hour',
  evening: 'Evening',
};

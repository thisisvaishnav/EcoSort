export * from './societyContent';
import { SOCIETY_STRINGS } from './societyContent';

export const SOCIETY_CONTENT = {
  narrative: {
    intro: SOCIETY_STRINGS.narrative.welcome,
    ...SOCIETY_STRINGS.narrative,
  },
  dialogue: {
    kaiGreet: SOCIETY_STRINGS.narrative.welcome,
  },
};

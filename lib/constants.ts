export const PSYCHO_TAGS = [
  'Disciplined', 
  'FOMO', 
  'Revenge Trade', 
  'Hesitant', 
  'Early Exit', 
  'Chasing', 
  'Boredom'
] as const;

export type PsychoTag = typeof PSYCHO_TAGS[number];

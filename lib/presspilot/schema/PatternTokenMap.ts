export type PatternToken = {
  token: string;
  description: string;
  source: 'hero' | 'features' | 'contact' | 'generic';
};

export interface PatternTokenMap {
  patternId: string;
  tokens: PatternToken[];
}


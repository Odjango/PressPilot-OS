export interface KitSchema {
  id: string;
  label: string;
  description?: string;
  styleVariationId: string;
  copyId: string;
  allowedSections: string[];
  tokens: string[];
}


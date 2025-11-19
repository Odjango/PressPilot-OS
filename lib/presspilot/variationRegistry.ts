import osManifest from '../../presspilot.os.json';
import { VariationSchema } from '@/lib/presspilot/schema';

interface OsManifestShape {
  styles: Record<string, VariationSchema>;
  version: string;
  schemaVersion: number;
}

const manifest = osManifest as OsManifestShape;

function validateVariation(entry: VariationSchema | undefined, id: string): VariationSchema {
  if (!entry) {
    throw new Error(`Style variation "${id}" missing from manifest.`);
  }

  if (!entry.id || !entry.title || !entry.paletteFile) {
    throw new Error(`Style variation "${id}" missing required fields.`);
  }

  return entry;
}

const variationList: VariationSchema[] = Object.keys(manifest.styles || {}).map((key) =>
  validateVariation(manifest.styles[key], key)
);

export function getAllVariations(): VariationSchema[] {
  return variationList;
}

export function getVariationById(id: string): VariationSchema | undefined {
  return variationList.find((variation) => variation.id === id);
}


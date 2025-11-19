import osManifest from '../../presspilot.os.json';
import { KitSchema } from '@/lib/presspilot/schema';

interface OsManifestShape {
  version: string;
  schemaVersion: number;
  kits: Record<string, KitSchema>;
  styles: Record<string, unknown>;
  copy: Record<string, unknown>;
}

const manifest: OsManifestShape = osManifest as OsManifestShape;

function validateKit(entry: KitSchema | undefined, id: string): KitSchema {
  if (!entry) {
    throw new Error(`Kit "${id}" missing from manifest.`);
  }

  const requiredFields: Array<keyof KitSchema> = [
    'id',
    'label',
    'styleVariationId',
    'copyId',
    'allowedSections',
    'tokens'
  ];

  for (const field of requiredFields) {
    if ((entry as any)[field] === undefined) {
      throw new Error(`Kit "${id}" missing required field "${String(field)}".`);
    }
  }

  return entry;
}

const kitList: KitSchema[] = Object.keys(manifest.kits || {}).map((key) =>
  validateKit(manifest.kits[key], key)
);

export function getAllKits(): KitSchema[] {
  return kitList;
}

export function getKitById(id: string): KitSchema | undefined {
  return kitList.find((kit) => kit.id === id);
}


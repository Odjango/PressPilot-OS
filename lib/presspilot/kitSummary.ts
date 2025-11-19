import path from 'path';
import fs from 'fs/promises';

export interface KitSummary {
  slug: string;
  brandName: string;
  businessTypeId: string | null;
  styleVariation: string | null;
  createdAt: string;
}

export async function writeKitSummaryFile(targetDir: string, summary?: KitSummary | null) {
  if (!summary) {
    return;
  }

  const filePath = path.join(targetDir, 'presspilot-kit.json');
  const contents = JSON.stringify(summary, null, 2);
  await fs.writeFile(filePath, contents, 'utf8');
}


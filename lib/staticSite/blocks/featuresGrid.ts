import { PressPilotFeatureConfig } from '@/lib/presspilot/kit';

function ensureFeatures(list: PressPilotFeatureConfig[]): PressPilotFeatureConfig[] {
  const fallback: PressPilotFeatureConfig = {
    icon: '⭐',
    label: 'Feature',
    description: 'Describe a key benefit here.'
  };

  const clone = [...list];
  while (clone.length < 4) {
    clone.push(clone[0] ?? { ...fallback });
  }

  return clone.slice(0, 4);
}

export function renderFeaturesGrid(
  heading: string,
  features: PressPilotFeatureConfig[]
): string {
  const safeHeading = heading?.trim() || 'Everything you need to launch';
  const items = ensureFeatures(features)
    .map(
      (feature) => `
      <div class="feature-card">
        <h3>${feature.icon ?? '⭐'} ${feature.label}</h3>
        <p>${feature.description}</p>
      </div>`
    )
    .join('');

  return `
  <section id="about" class="presspilot-section features-grid">
    <h2>${safeHeading}</h2>
    <div class="feature-grid">
      ${items}
    </div>
  </section>
  `;
}


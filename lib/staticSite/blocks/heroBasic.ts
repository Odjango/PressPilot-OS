import { PressPilotHeroConfig } from '@/lib/presspilot/kit';

function safe(value: string | undefined, fallback = ''): string {
  return value?.trim() ?? fallback;
}

export function renderHeroBasic(hero: PressPilotHeroConfig): string {
  const primaryLabel = safe(hero.primaryCta, 'Get started');
  const secondaryLabel = safe(hero.secondaryCta, 'See live demo');
  const primaryUrl = safe(hero.primaryCtaUrl, '#contact');
  const secondaryUrl = safe(hero.secondaryCtaUrl, '#about');

  return `
  <section id="home" class="presspilot-section hero-basic">
    <div class="hero-eyebrow">Built with PressPilot Golden Foundation</div>
    <h1 class="hero-title">${safe(hero.title, 'Launch with PressPilot')}</h1>
    <p class="hero-subtitle">${safe(hero.subtitle, 'Drop your business info into curated kits and publish without friction.')}</p>
    <div class="hero-ctas">
      <a class="btn primary" href="${primaryUrl}">${primaryLabel}</a>
      <a class="btn secondary" href="${secondaryUrl}">${secondaryLabel}</a>
    </div>
  </section>
  `;
}


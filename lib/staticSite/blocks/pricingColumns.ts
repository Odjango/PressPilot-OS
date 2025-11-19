import { PressPilotNormalizedContext } from '@/types/presspilot';

interface PricingTier {
  name: string;
  price: string;
  perks: string[];
  highlight?: boolean;
}

export function renderPricingColumns(context: PressPilotNormalizedContext): string {
  const tiers: PricingTier[] = [
    {
      name: 'Starter',
      price: '$19 / month',
      perks: ['1 brand setup', 'Basic analytics', 'Email support']
    },
    {
      name: 'Growth',
      price: '$49 / month',
      perks: ['Unlimited kits', 'Mode-aware add-ons', 'Priority support'],
      highlight: true
    },
    {
      name: 'Pro',
      price: '$99 / month',
      perks: ['Dedicated strategist', 'Custom exports', 'Training & SLA']
    }
  ];

  const columns = tiers
    .map((tier) => {
      const perkList = tier.perks.map((item) => `<li>${item}</li>`).join('');
      return `
        <div class="pricing-card${tier.highlight ? ' highlight' : ''}">
          <h3>${tier.name}</h3>
          <p class="price">${tier.price}</p>
          <ul>${perkList}</ul>
          <a class="btn primary" href="#contact">Choose ${tier.name}</a>
        </div>`;
    })
    .join('');

  return `
  <section id="shop" class="presspilot-section pricing-columns">
    <h2>Plans for every ${context.brand.category}</h2>
    <p class="section-subhead">${context.brand.name} can switch tiers any time—kits stay in sync automatically.</p>
    <div class="pricing-grid">
      ${columns}
    </div>
  </section>
  `;
}


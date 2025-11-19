import { PressPilotContactConfig } from '@/lib/presspilot/kit';

function safe(value: string | undefined, fallback = ''): string {
  return value?.trim() ?? fallback;
}

export function renderCtaContact(contact: PressPilotContactConfig): string {
  return `
  <section id="contact" class="presspilot-section cta-contact">
    <div class="cta-contact__copy">
      <h2>${safe(contact.headline, 'Ready to connect?')}</h2>
      <p>${safe(
        contact.body,
        'Tell us about your business and we’ll assemble a tailored kit in minutes.'
      )}</p>
      <ul>
        <li><strong>Email:</strong> ${safe(contact.email)}</li>
      </ul>
    </div>
    <div class="cta-contact__card">
      <p>${safe(contact.primaryCta, 'Book a call')}</p>
    </div>
  </section>
  `;
}


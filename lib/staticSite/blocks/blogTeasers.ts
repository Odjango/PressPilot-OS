import { PressPilotNormalizedContext } from '@/types/presspilot';

function buildExcerpt(source: string | undefined, max = 160): string {
  if (!source) return 'Share recent launches, press mentions, and product updates.';
  return source.length > max ? `${source.slice(0, max)}…` : source;
}

export function renderBlogTeasers(context: PressPilotNormalizedContext): string {
  const excerpt = buildExcerpt(context.narrative.description_long);
  const posts = [
    {
      title: 'Shipping faster with PressPilot kits',
      meta: 'Product · Today',
      body: excerpt
    },
    {
      title: 'How we localize for new markets',
      meta: 'Playbook · Yesterday',
      body: 'Multilingual presets, RTL-aware sections, and repeatable QA steps keep launches predictable.'
    },
    {
      title: 'Behind the Golden Foundation theme',
      meta: 'Design · 2 days ago',
      body: 'A unified pattern library gives SaaS, local biz, restaurant, and ecommerce kits the same polish.'
    }
  ]
    .map(
      (post) => `
      <article class="blog-card">
        <small>${post.meta}</small>
        <h3>${post.title}</h3>
        <p>${post.body}</p>
      </article>`
    )
    .join('');

  return `
  <section id="blog" class="presspilot-section blog-teasers">
    <h2>Latest updates</h2>
    <p class="section-subhead">Use this strip to keep teammates and customers in the loop.</p>
    <div class="blog-grid">
      ${posts}
    </div>
  </section>
  `;
}


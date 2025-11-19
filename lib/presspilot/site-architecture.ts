export type SiteArchetype = 'service' | 'ecommerce' | 'restaurant_cafe' | 'blog' | 'portfolio';

export type NavItemId =
  | 'home'
  | 'about'
  | 'services'
  | 'shop'
  | 'menu'
  | 'blog'
  | 'topics'
  | 'portfolio'
  | 'contact';

export interface NavItemSpec {
  id: NavItemId;
  label: string;
}

export const EXTRA_NAV_SLOTS = 2;

export function inferSiteArchetype(businessCategory: string | null | undefined): SiteArchetype {
  const normalized = (businessCategory || '').toLowerCase();

  if (['ecommerce', 'online_store', 'online-store', 'shop', 'store'].includes(normalized)) {
    return 'ecommerce';
  }

  if (
    [
      'restaurant_cafe',
      'restaurant',
      'cafe',
      'coffee_shop',
      'coffee-shop',
      'food',
      'food_service',
      'food-service',
      'food_truck',
      'food-truck',
      'bar'
    ].includes(normalized)
  ) {
    return 'restaurant_cafe';
  }

  if (['blog', 'magazine', 'publication'].includes(normalized)) {
    return 'blog';
  }

  if (
    [
      'portfolio',
      'creative_studio',
      'creative-studio',
      'design_studio',
      'photography',
      'photographer',
      'artist'
    ].includes(normalized)
  ) {
    return 'portfolio';
  }

  return 'service';
}

export const NAV_SHELLS: Record<SiteArchetype, NavItemSpec[]> = {
  service: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ],
  ecommerce: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'shop', label: 'Shop' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ],
  restaurant_cafe: [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ],
  blog: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'blog', label: 'Blog' },
    { id: 'topics', label: 'Topics' },
    { id: 'contact', label: 'Contact' }
  ],
  portfolio: [
    { id: 'home', label: 'Home' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'About' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ]
};

export function getSiteNavForCategory(businessCategory: string | null | undefined) {
  const archetype = inferSiteArchetype(businessCategory);
  const navShell = NAV_SHELLS[archetype];
  return { archetype, navShell };
}


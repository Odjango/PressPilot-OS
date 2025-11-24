// app/mvp-demo/businessCategories.ts

export type BusinessCategoryId =
  | "local_service"
  | "restaurant_cafe"
  | "health_fitness"
  | "beauty_salon"
  | "professional_services"
  | "online_coach"
  | "saas_product"
  | "ecommerce_store";

export type BusinessCategory = {
  id: BusinessCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  defaultMenu: string[]; // order of menu items by title
  defaultPages: { slug: string; title: string }[];
};

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: "local_service",
    label: "Local Service / Trades",
    shortLabel: "Local Service",
    description: "Plumbers, electricians, HVAC, repair & home services.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "restaurant_cafe",
    label: "Restaurant / Café",
    shortLabel: "Restaurant",
    description: "Cafés, bistros, takeaways, bakeries & bars.",
    defaultMenu: ["Home", "Menu", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "menu", title: "Menu" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "health_fitness",
    label: "Health & Fitness",
    shortLabel: "Health",
    description: "Gyms, yoga studios, physiotherapists, nutritionists.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "beauty_salon",
    label: "Beauty / Salon / Spa",
    shortLabel: "Beauty",
    description: "Salons, barbers, spas, nail bars & cosmetics.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "professional_services",
    label: "Professional Services",
    shortLabel: "Pro Services",
    description: "Law firms, accountants, consultants & agencies.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "online_coach",
    label: "Online Coach / Personal Brand",
    shortLabel: "Coach",
    description: "Coaches, creators, mentors & personal brands.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "saas_product",
    label: "SaaS / Software Product",
    shortLabel: "SaaS",
    description: "Dashboards, software tools & online platforms.",
    defaultMenu: ["Home", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
  {
    id: "ecommerce_store",
    label: "E-Commerce Store",
    shortLabel: "E-Commerce",
    description: "Online stores, product catalogs & marketplaces.",
    defaultMenu: ["Home", "Shop", "About", "Services", "Blog", "Contact"],
    defaultPages: [
      { slug: "home", title: "Home" },
      { slug: "shop", title: "Shop" },
      { slug: "about", title: "About" },
      { slug: "services", title: "Services" },
      { slug: "blog", title: "Blog" },
      { slug: "contact", title: "Contact" },
    ],
  },
];

export function getBusinessCategoryById(
  id: BusinessCategoryId | undefined | null
): BusinessCategory | null {
  if (!id) return null;
  return BUSINESS_CATEGORIES.find((c) => c.id === id) ?? null;
}


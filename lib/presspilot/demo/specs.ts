import { PressPilotSaaSInput } from '@/types/presspilot';

export interface DemoKitSpec {
  businessTypeId: 'saas' | 'local-biz' | 'restaurant_cafe' | 'ecommerce_store';
  styleVariation: 'saas-bright' | 'local-biz-soft' | 'restaurant-soft' | 'ecom-bold';
  payload: PressPilotSaaSInput;
}

const longDescription = (
  intro: string,
  details: string
): string =>
  [
    intro,
    details,
    'Each engagement highlights the differentiators, customer stories, and go-to-market rhythm that PressPilot kits emphasize by default.'
  ].join(' ');

export const demoKitSpecs: DemoKitSpec[] = [
  {
    businessTypeId: 'saas',
    styleVariation: 'saas-bright',
    payload: {
      brand: {
        business_name: 'CloudSpark CRM',
        business_tagline: 'Sales orchestration for modern revenue teams',
        business_category: 'service',
        region_or_country: 'United States'
      },
      language: {
        primary_language: 'en',
        secondary_languages: ['es'],
        rtl_required: false
      },
      narrative: {
        description_long: longDescription(
          'CloudSpark CRM helps RevOps leaders collapse spreadsheets, email threads, and call notes into one clear timeline so teams respond faster.',
          'The platform includes AI nudges, territory mapping, and ready-to-send playbooks so new reps feel senior on day one.'
        ),
        audience_notes: 'Mid-market B2B SaaS and service orgs',
        niche_tags: ['crm', 'revops', 'automation'],
        goals: 'Increase demo conversions by 30% this quarter'
      },
      visualAssets: {
        has_logo: true,
        logo_external_url: 'https://example.com/cloudspark-logo.svg',
        reference_site_url: 'https://linear.app',
        image_source_preference: 'mixed',
        image_keywords: ['dashboard', 'collaboration', 'analytics']
      },
      visualControls: {
        palette_id: 'pp-saas-bright',
        font_pair_id: 'pp-inter-sans',
        layout_density: 'balanced',
        corner_style: 'rounded',
        primary_ctas: [
          { label: 'Book live demo', url: '#contact' },
          { label: 'Watch 2-min tour', url: '#features' }
        ]
      },
      modes: {
        business_category: 'service',
        restaurant: null,
        ecommerce: null
      },
      system: {
        plan_tier: 'pro'
      }
    }
  },
  {
    businessTypeId: 'local-biz',
    styleVariation: 'local-biz-soft',
    payload: {
      brand: {
        business_name: 'Neighborhood Fixers',
        business_tagline: 'Reliable home repairs with concierge scheduling',
        business_category: 'service',
        region_or_country: 'Austin, TX'
      },
      language: {
        primary_language: 'en',
        secondary_languages: [],
        rtl_required: false
      },
      narrative: {
        description_long: longDescription(
          'Neighborhood Fixers is a technician-led collective covering HVAC, electrical, and small remodeling jobs for bungalows and duplexes.',
          'Clients book through text or WhatsApp, get photo confirmations, and can tip or subscribe for seasonal maintenance.'
        ),
        audience_notes: 'Homeowners and property managers within a 20-mile radius',
        niche_tags: ['home services', 'maintenance', 'local'],
        goals: 'Drive 40 inbound bookings per week with clear CTA paths'
      },
      visualAssets: {
        has_logo: false,
        reference_site_url: 'https://www.angie.com',
        image_source_preference: 'stock-only',
        image_keywords: ['craftsman home', 'tools', 'crew portrait']
      },
      visualControls: {
        palette_id: 'pp-local-soft',
        font_pair_id: 'pp-source-sans',
        layout_density: 'cozy',
        corner_style: 'mixed',
        primary_ctas: [
          { label: 'Schedule a visit', url: '#contact' },
          { label: 'See service menu', url: '#services' }
        ]
      },
      modes: {
        business_category: 'service',
        restaurant: null,
        ecommerce: null
      },
      system: {
        plan_tier: 'free'
      }
    }
  },
  {
    businessTypeId: 'restaurant_cafe',
    styleVariation: 'restaurant-soft',
    payload: {
      brand: {
        business_name: 'New Tony Pizza',
        business_tagline: 'Wood-fired pies and neighborhood hospitality',
        business_category: 'restaurant_cafe',
        region_or_country: 'Chicago'
      },
      language: {
        primary_language: 'en',
        secondary_languages: ['it'],
        rtl_required: false
      },
      narrative: {
        description_long: longDescription(
          'New Tony Pizza turns a century-old bakery into an open-kitchen trattoria with naturally leavened dough, local produce, and live jazz on weekends.',
          'Guests split shareable plates, browse seasonal cocktails, and order wood-fired classics with QR-based reordering at the table.'
        ),
        audience_notes: 'Neighborhood foodies, downtown lunch crowd, tourists',
        niche_tags: ['pizza', 'restaurant', 'live music'],
        goals: 'Promote reservations and online ordering equally'
      },
      visualAssets: {
        has_logo: true,
        reference_site_url: 'https://www.littlemadisonnyc.com',
        image_source_preference: 'stock-only',
        image_keywords: ['wood fired oven', 'family dinner', 'aperol spritz']
      },
      visualControls: {
        palette_id: 'pp-terracotta',
        font_pair_id: 'pp-serif-sans',
        layout_density: 'cozy',
        corner_style: 'rounded',
        primary_ctas: [
          { label: 'Reserve a table', url: '#reserve' },
          { label: 'View full menu', url: '#menu' }
        ]
      },
      modes: {
        business_category: 'restaurant_cafe',
        restaurant: {
          enabled: true,
          supports_dine_in: true,
          supports_takeout: true,
          supports_delivery: true,
          menu_sections: [
            {
              name: 'Wood-Fired Pizzas',
              items: [
                { name: 'Heritage Margherita', description: 'San Marzano, basil oil, burrata', price: '18' },
                { name: 'Charred Funghi', description: 'Wild mushrooms, taleggio, chili honey', price: '22' }
              ]
            }
          ],
          reservation_link: 'https://newtonypizza.com/reserve',
          order_online_link: 'https://newtonypizza.com/order'
        },
        ecommerce: null
      },
      system: {
        plan_tier: 'pro'
      }
    }
  },
  {
    businessTypeId: 'ecommerce_store',
    styleVariation: 'ecom-bold',
    payload: {
      brand: {
        business_name: 'Pixel Sneaks Store',
        business_tagline: 'Limited sneakers for design-forward collectors',
        business_category: 'ecommerce',
        region_or_country: 'Global'
      },
      language: {
        primary_language: 'en',
        secondary_languages: ['fr'],
        rtl_required: false
      },
      narrative: {
        description_long: longDescription(
          'Pixel Sneaks Store curates capsule drops of mid-top sneakers inspired by vaporwave posters, hometown clubs, and artist residencies.',
          'Members unlock early access, NFT-backed provenance, and size-swaps handled through a dedicated concierge.'
        ),
        audience_notes: 'Streetwear communities, sneakerheads, design students',
        niche_tags: ['sneakers', 'streetwear', 'drops'],
        goals: 'Grow waitlist and highlight limited inventory urgency'
      },
      visualAssets: {
        has_logo: true,
        image_source_preference: 'ai-only',
        image_keywords: ['sneakers', 'fluorescent lighting', 'studio still life']
      },
      visualControls: {
        palette_id: 'pp-ecom-bold',
        font_pair_id: 'pp-sans-wide',
        layout_density: 'balanced',
        corner_style: 'sharp',
        primary_ctas: [
          { label: 'Shop the drop', url: '#shop' },
          { label: 'Join waitlist', url: '#contact' }
        ]
      },
      modes: {
        business_category: 'ecommerce',
        restaurant: null,
        ecommerce: {
          enabled: true,
          store_type: 'physical',
          currency: 'USD',
          product_categories: ['Sneakers', 'Accessories'],
          sample_products: [
            { name: 'Neon Pulse 84', description: 'Gradient mesh upper with reflective piping', price: 185 },
            { name: 'Courier Slipstream', description: 'Ultra-light knit built for urban riders', price: 210 }
          ],
          policies: {
            shipping: 'Global express fulfilled in 3-5 days.',
            returns: 'Complimentary exchanges within 30 days.'
          }
        }
      },
      system: {
        plan_tier: 'enterprise'
      }
    }
  }
];



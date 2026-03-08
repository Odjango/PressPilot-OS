import fs from 'fs-extra';
import path from 'node:path';
// DEPRECATED: Old Node.js generator removed.
// import { generateTheme } from '../src/generator';
import type { BrandMode, GeneratorData, PageData } from '../types/generator-legacy';

interface ShowcaseTheme {
  key: string;
  vertical: 'restaurant' | 'saas' | 'portfolio' | 'local-service' | 'ecommerce';
  slug: string;
  brandMode: BrandMode;
  businessType: string;
  recipeHint: string;
  pages: PageData[];
  data: GeneratorData;
}

const ROOT = process.cwd();
const SHOWCASE_ROOT = path.join(ROOT, 'showcase');
const DATA_DIR = path.join(SHOWCASE_ROOT, 'data');
const ZIPS_DIR = path.join(SHOWCASE_ROOT, 'zips');

function img(tag: string, n: number): string {
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(tag)}&sig=${n}`;
}

function imageSet(tags: string[], count: number, offset: number): string[] {
  return Array.from({ length: count }, (_, i) => img(tags[i % tags.length], offset + i));
}

function flattenTestimonials(testimonials: Array<{ quote: string; name: string; role: string; company?: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  testimonials.slice(0, 8).forEach((t, i) => {
    const idx = i + 1;
    entries[`testimonial_${idx}_quote`] = t.quote;
    entries[`testimonial_${idx}_name`] = t.name;
    entries[`testimonial_${idx}_role`] = t.role;
    entries[`testimonial_${idx}_company`] = t.company || '';
    entries[`testimonial_${idx}_product`] = t.company || '';
    entries[`testimonial_${idx}_rating`] = '5';
  });
  return entries;
}

function flattenProducts(products: Array<{ title: string; price: string; description: string; image: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  products.slice(0, 16).forEach((p, i) => {
    const idx = i + 1;
    entries[`product_${idx}_title`] = p.title;
    entries[`product_${idx}_price`] = p.price;
    entries[`product_${idx}_description`] = p.description;
    entries[`product_${idx}_image`] = p.image;
  });
  return entries;
}

function flattenProjects(projects: Array<{ title: string; category: string; description: string; image: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  projects.slice(0, 12).forEach((p, i) => {
    const idx = i + 1;
    entries[`project_${idx}_title`] = p.title;
    entries[`project_${idx}_category`] = p.category;
    entries[`project_${idx}_description`] = p.description;
    entries[`project_${idx}_image`] = p.image;
  });
  return entries;
}

function flattenServices(services: Array<{ title: string; description: string; price?: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  services.slice(0, 8).forEach((s, i) => {
    const idx = i + 1;
    entries[`service_${idx}_title`] = s.title;
    entries[`service_${idx}_description`] = s.description;
    entries[`service_${idx}_price`] = s.price || '';
    entries[`SERVICE_${idx}_TITLE`] = s.title;
    entries[`SERVICE_${idx}_TEXT`] = s.description;
  });
  return entries;
}

function flattenFeatures(features: Array<{ title: string; description: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  features.slice(0, 8).forEach((f, i) => {
    const idx = i + 1;
    entries[`feature_${idx}_title`] = f.title;
    entries[`feature_${idx}_description`] = f.description;
  });
  return entries;
}

function flattenCategories(categories: Array<{ name: string; image: string }>): Record<string, string> {
  const entries: Record<string, string> = {};
  categories.slice(0, 4).forEach((c, i) => {
    const idx = i + 1;
    entries[`category_${idx}_name`] = c.name;
    entries[`category_${idx}_image`] = c.image;
  });
  return entries;
}

function commonPages(vertical: ShowcaseTheme['vertical']): PageData[] {
  if (vertical === 'restaurant') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Menu', slug: 'menu', template: 'universal-menu' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Reservations', slug: 'reservations', template: 'universal-reservation' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'saas') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Features', slug: 'features', template: 'universal-services' },
      { title: 'Pricing', slug: 'pricing', template: 'universal-services' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'portfolio') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Gallery', slug: 'gallery', template: 'universal-portfolio' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'local-service') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Services', slug: 'services', template: 'universal-services' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'FAQ', slug: 'faq', template: 'universal-services' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  return [
    { title: 'Home', slug: 'home', template: 'universal-home' },
    { title: 'Shop', slug: 'shop', template: 'universal-shop' },
    { title: 'About', slug: 'about', template: 'universal-about' },
    { title: 'FAQ', slug: 'faq', template: 'universal-services' },
    { title: 'Contact', slug: 'contact', template: 'universal-contact' },
  ];
}

const themes: ShowcaseTheme[] = (() => {
  const bellaImages = imageSet(['italian restaurant', 'pasta dish', 'wine dinner', 'chef kitchen', 'restaurant interior'], 22, 10);
  const tokyoImages = imageSet(['ramen bowl', 'japanese restaurant', 'noodle soup', 'izakaya', 'chef ramen'], 20, 100);
  const cloudflowImages = imageSet(['saas dashboard', 'team collaboration', 'software office', 'analytics screen'], 18, 200);
  const tasklyImages = imageSet(['startup team', 'task management app', 'productivity app', 'colorful workspace'], 18, 300);
  const sarahImages = imageSet(['ui ux design', 'creative portfolio', 'app mockup', 'brand identity'], 20, 400);
  const marcusImages = imageSet(['photography portrait', 'wedding photography', 'street photography', 'camera studio'], 22, 500);
  const sparkleImages = imageSet(['cleaning service', 'home cleaning', 'professional cleaner', 'happy home'], 18, 600);
  const dentalImages = imageSet(['dental clinic', 'dentist office', 'dental care', 'smiling patient'], 18, 700);
  const artisanImages = imageSet(['handmade ceramics', 'artisan textiles', 'craft jewelry', 'small business products'], 24, 800);
  const urbanImages = imageSet(['streetwear fashion', 'urban outfit', 'sneakers', 'fashion studio'], 24, 900);

  return [
    {
      key: 'bella-trattoria',
      vertical: 'restaurant',
      slug: 'bella-trattoria',
      brandMode: 'modern',
      businessType: 'fine-dining',
      recipeHint: 'modern-dining',
      pages: commonPages('restaurant'),
      data: {
        name: 'Bella Trattoria',
        industry: 'restaurant',
        businessType: 'fine-dining',
        brandMode: 'modern',
        hero_headline: 'Authentic Italian Cuisine Since 1985',
        hero_subheadline: 'House-made pasta, wood-fired specialties, and warm hospitality in the heart of San Francisco.',
        description: 'Bella Trattoria is a multi-generational Italian restaurant rooted in regional recipes from Tuscany and Emilia-Romagna. Our chefs source produce from Bay Area farms and pair every plate with an exceptional Italian and California wine program.\n\nFrom casual weeknight dinners to anniversary celebrations, every meal is designed to feel timeless, generous, and unforgettable.',
        email: 'reservations@bellatrattoria.com',
        phone: '(415) 555-0148',
        address: '245 Columbus Avenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94133',
        country: 'USA',
        openingHours: {
          Monday: 'Closed', Tuesday: '5:00 PM - 10:00 PM', Wednesday: '5:00 PM - 10:00 PM', Thursday: '5:00 PM - 10:00 PM', Friday: '5:00 PM - 11:00 PM', Saturday: '4:30 PM - 11:00 PM', Sunday: '4:30 PM - 9:30 PM'
        },
        socialLinks: {
          facebook: 'https://facebook.com/bellatrattoria', instagram: 'https://instagram.com/bellatrattoria', twitter: 'https://x.com/bellatrattoria'
        },
        pages: commonPages('restaurant'),
        images: bellaImages,
        menus: [
          { title: 'Appetizers', items: [
            { name: 'Burrata e Pomodoro', price: '$18', description: 'Creamy burrata, heirloom tomatoes, basil oil.' },
            { name: 'Calamari Fritti', price: '$17', description: 'Crisp calamari, lemon aioli, chili flakes.' },
            { name: 'Arancini al Tartufo', price: '$16', description: 'Truffle risotto fritters, parmesan snow.' },
            { name: 'Bruschetta Trio', price: '$14', description: 'Tomato basil, whipped ricotta, olive tapenade.' }
          ]},
          { title: 'Pasta', items: [
            { name: 'Tagliatelle Bolognese', price: '$27', description: 'Slow-braised beef and pork ragu, parmigiano.' },
            { name: 'Cacio e Pepe', price: '$23', description: 'Pecorino romano, black pepper, handmade tonnarelli.' },
            { name: 'Lobster Ravioli', price: '$34', description: 'Saffron cream, confit cherry tomatoes.' },
            { name: 'Pesto Trofie', price: '$24', description: 'Genovese pesto, green beans, potatoes.' }
          ]},
          { title: 'Mains & Desserts', items: [
            { name: 'Osso Buco Milanese', price: '$39', description: 'Braised veal shank, saffron risotto.' },
            { name: 'Branzino al Forno', price: '$36', description: 'Roasted Mediterranean sea bass, fennel salad.' },
            { name: 'Tiramisu Classico', price: '$13', description: 'Espresso-soaked savoiardi, mascarpone cream.' },
            { name: 'Panna Cotta', price: '$12', description: 'Vanilla bean custard, seasonal berries.' }
          ]}
        ],
        team: [
          { name: 'Marco Bianchi', role: 'Executive Chef', bio: 'Leads kitchen operations with 20 years of fine-dining experience.' },
          { name: 'Elena Rossi', role: 'Pastry Chef', bio: 'Specializes in classic and modern Italian desserts.' },
          { name: 'Luca Ferraro', role: 'Sommelier', bio: 'Curates award-winning wine pairings and cellar selections.' }
        ],
        testimonials: [
          { quote: 'Every pasta course felt like a trip to Florence.', name: 'Natalie Brooks', role: 'Food Critic', company: 'Bay Eats' },
          { quote: 'One of the most polished dining experiences in SF.', name: 'James Patel', role: 'General Manager', company: 'Harbor Hotels' },
          { quote: 'The service and timing were flawless from start to finish.', name: 'Anika Roy', role: 'Event Director', company: 'North Point Events' },
          { quote: 'Their wine pairings elevated every dish beautifully.', name: 'Chris Lambert', role: 'Wine Club Member', company: 'SF Vintners' },
          { quote: 'Perfect anniversary dinner, memorable and warm.', name: 'Maya Chen', role: 'Customer', company: 'Google' },
          { quote: 'Refined menu with authentic regional character.', name: 'Leo Diaz', role: 'Chef', company: 'Private Dining Co.' }
        ],
        ...flattenTestimonials([
          { quote: 'Every pasta course felt like a trip to Florence.', name: 'Natalie Brooks', role: 'Food Critic', company: 'Bay Eats' },
          { quote: 'One of the most polished dining experiences in SF.', name: 'James Patel', role: 'General Manager', company: 'Harbor Hotels' },
          { quote: 'The service and timing were flawless from start to finish.', name: 'Anika Roy', role: 'Event Director', company: 'North Point Events' },
          { quote: 'Their wine pairings elevated every dish beautifully.', name: 'Chris Lambert', role: 'Wine Club Member', company: 'SF Vintners' },
          { quote: 'Perfect anniversary dinner, memorable and warm.', name: 'Maya Chen', role: 'Customer', company: 'Google' },
          { quote: 'Refined menu with authentic regional character.', name: 'Leo Diaz', role: 'Chef', company: 'Private Dining Co.' }
        ]),
      }
    },
    {
      key: 'tokyo-ramen-house', vertical: 'restaurant', slug: 'tokyo-ramen-house', brandMode: 'bold', businessType: 'casual', recipeHint: 'classic-bistro', pages: commonPages('restaurant'),
      data: {
        name: 'Tokyo Ramen House', industry: 'restaurant', businessType: 'casual', brandMode: 'bold',
        hero_headline: 'Soul-Warming Bowls, Crafted Daily',
        hero_subheadline: 'Rich broths, handmade noodles, and late-night comfort in Midtown Manhattan.',
        description: 'Tokyo Ramen House brings Tokyo alleyway flavor to New York with deeply layered broths simmered for 16 hours and noodles made fresh every morning.\n\nOur menu celebrates classic ramen traditions while introducing limited monthly bowls inspired by seasonal ingredients.',
        email: 'hello@tokyoramenhouse.com', phone: '(212) 555-0192', address: '118 W 46th Street', city: 'New York', state: 'NY', zip: '10036', country: 'USA',
        openingHours: { Monday: '11:30 AM - 10:00 PM', Tuesday: '11:30 AM - 10:00 PM', Wednesday: '11:30 AM - 10:00 PM', Thursday: '11:30 AM - 11:00 PM', Friday: '11:30 AM - 12:00 AM', Saturday: '12:00 PM - 12:00 AM', Sunday: '12:00 PM - 9:30 PM' },
        socialLinks: { instagram: 'https://instagram.com/tokyoramenhouse', facebook: 'https://facebook.com/tokyoramenhouse', twitter: 'https://x.com/tokyoramenhouse' },
        pages: commonPages('restaurant'), images: tokyoImages,
        menus: [{ title: 'Ramen & Sides', items: [
          { name: 'Tonkotsu Classic', price: '$18', description: 'Pork bone broth, chashu, ajitama, scallions.' },
          { name: 'Spicy Miso Ramen', price: '$19', description: 'Miso broth, chili crisp, corn, bamboo shoots.' },
          { name: 'Shoyu Signature', price: '$17', description: 'Chicken-soy broth, nori, menma, naruto.' },
          { name: 'Tantanmen', price: '$19', description: 'Sesame broth, spicy pork, bok choy.' },
          { name: 'Yuzu Shio', price: '$18', description: 'Light salt broth, yuzu zest, chicken chashu.' },
          { name: 'Black Garlic Ramen', price: '$20', description: 'Mayu oil, roasted garlic, pork belly.' },
          { name: 'Vegan Umami Bowl', price: '$17', description: 'Mushroom kombu broth, tofu, kale, shiitake.' },
          { name: 'Tsukemen', price: '$19', description: 'Dipping noodles, concentrated pork-fish broth.' },
          { name: 'Chicken Karaage', price: '$11', description: 'Japanese fried chicken, yuzu mayo.' },
          { name: 'Gyoza (6pc)', price: '$9', description: 'Pan-seared pork dumplings with ponzu.' }
        ]}],
        team: [
          { name: 'Kenji Sato', role: 'Head Ramen Chef', bio: 'Former Tokyo ramen master now leading the Manhattan kitchen.' },
          { name: 'Mika Tanaka', role: 'Sous Chef', bio: 'Oversees prep and seasonal bowl innovation.' }
        ],
        ...flattenTestimonials([
          { quote: 'Closest thing to Tokyo ramen in NYC.', name: 'Riley Park', role: 'Food Blogger', company: 'Noodle Notes' },
          { quote: 'Broth depth is incredible, every time.', name: 'Ava Klein', role: 'Designer', company: 'Studio K' },
          { quote: 'Fast service and consistently great quality.', name: 'Noah Bennett', role: 'Producer', company: 'Broadway Crew' },
          { quote: 'Spicy miso is my weekly ritual.', name: 'Daniel Cruz', role: 'Engineer', company: 'Meta' },
          { quote: 'Late-night favorite after shows.', name: 'Sophia Vega', role: 'Performer', company: 'NY Stage Co.' }
        ])
      }
    },
    {
      key: 'cloudflow-app', vertical: 'saas', slug: 'cloudflow-app', brandMode: 'modern', businessType: 'enterprise', recipeHint: 'enterprise-product', pages: commonPages('saas'),
      data: {
        name: 'CloudFlow', industry: 'saas', businessType: 'enterprise', brandMode: 'modern',
        hero_headline: 'Streamline Your Workflow, Amplify Your Team',
        hero_subheadline: 'Plan, execute, and optimize cross-functional projects in one intelligent workspace.',
        description: 'CloudFlow is a project operations platform designed for fast-moving product and operations teams. Bring roadmaps, sprint delivery, approvals, and reporting into one workflow that scales from startup squads to global departments.\n\nWith flexible automation and real-time visibility, CloudFlow helps teams cut manual handoffs and ship with confidence.',
        pages: commonPages('saas'), images: cloudflowImages,
        email: 'sales@cloudflow.app', phone: '(415) 555-0109', address: '500 Howard St', city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA',
        socialLinks: { linkedin: 'https://linkedin.com/company/cloudflow', twitter: 'https://x.com/cloudflow', youtube: 'https://youtube.com/@cloudflow' },
        product_name: 'CloudFlow', tagline: 'Streamline Your Workflow, Amplify Your Team',
        price_basic: '$9', price_pro: '$29', price_enterprise: '$99',
        ...flattenFeatures([
          { title: 'Automated Project Timelines', description: 'Dynamic schedules update instantly when priorities change.' },
          { title: 'Cross-Team Workspaces', description: 'Coordinate product, design, engineering, and GTM in one place.' },
          { title: 'Approval Pipelines', description: 'Route work through legal, brand, and compliance automatically.' },
          { title: 'Live Portfolio Dashboards', description: 'Track health, budgets, and milestones across all initiatives.' },
          { title: 'AI Status Summaries', description: 'Generate weekly updates from real project activity.' },
          { title: 'Dependency Mapping', description: 'Visualize blockers before they impact release dates.' },
          { title: 'SLA Alerts', description: 'Prevent missed obligations with proactive notifications.' },
          { title: 'Enterprise SSO + SCIM', description: 'Secure identity management for every team and contractor.' }
        ]),
        ...flattenTestimonials([
          { quote: 'CloudFlow gave us one operating system for launches.', name: 'Priya Nair', role: 'VP Product', company: 'NovaStack' },
          { quote: 'We reduced project cycle time by 27% in one quarter.', name: 'Ethan Blake', role: 'Director of Ops', company: 'Synapse AI' },
          { quote: 'The dashboard visibility is a game changer for leadership.', name: 'Morgan Lee', role: 'COO', company: 'Zenbyte' },
          { quote: 'Approvals and audit trails are finally painless.', name: 'Arjun Patel', role: 'Head of Compliance', company: 'LedgerLoop' },
          { quote: 'Our teams adopted CloudFlow in less than two weeks.', name: 'Hannah Kim', role: 'Program Manager', company: 'OrbitSoft' },
          { quote: 'Integrations connected our stack without custom work.', name: 'Victor Ramos', role: 'IT Lead', company: 'GridFoundry' }
        ]),
      }
    },
    {
      key: 'taskly-startup', vertical: 'saas', slug: 'taskly-startup', brandMode: 'playful', businessType: 'startup', recipeHint: 'startup-landing', pages: commonPages('saas'),
      data: {
        name: 'Taskly', industry: 'saas', businessType: 'startup', brandMode: 'playful',
        hero_headline: 'Get Things Done, The Fun Way',
        hero_subheadline: 'Colorful task boards, smart reminders, and team momentum in one delightful app.',
        description: 'Taskly helps teams transform chaotic to-do lists into clear daily progress. Built for modern startups, Taskly combines playful UX with serious execution tools so teams can plan, sprint, and ship faster.\n\nFrom solo founders to scaling teams, Taskly keeps everyone aligned with less meeting overhead.',
        pages: commonPages('saas'), images: tasklyImages,
        email: 'hello@taskly.app', phone: '(646) 555-0122', address: '99 Hudson St', city: 'New York', state: 'NY', zip: '10013', country: 'USA',
        socialLinks: { linkedin: 'https://linkedin.com/company/taskly', twitter: 'https://x.com/tasklyapp', instagram: 'https://instagram.com/tasklyapp' },
        product_name: 'Taskly', tagline: 'Get Things Done, The Fun Way',
        price_basic: 'Free', price_pro: '$12', price_enterprise: '$25',
        ...flattenFeatures([
          { title: 'Drag-and-Drop Boards', description: 'Move work instantly across stages with smooth interactions.' },
          { title: 'Smart Reminders', description: 'Auto-reminders based on deadlines and workload risk.' },
          { title: 'Sprint Templates', description: 'Launch reusable workflows for recurring projects.' },
          { title: 'Focus Mode', description: 'Highlight top priorities and mute distractions.' },
          { title: 'Celebration Nudges', description: 'Built-in milestone celebrations for team motivation.' },
          { title: 'Quick Reports', description: 'Generate stakeholder updates in seconds.' }
        ]),
        ...flattenTestimonials([
          { quote: 'Taskly made planning actually enjoyable.', name: 'Liam Ortiz', role: 'Founder', company: 'PixelMint' },
          { quote: 'Our team velocity improved in the first month.', name: 'Keira Shaw', role: 'Head of Product', company: 'Glowlytics' },
          { quote: 'Great UX and enough power for real execution.', name: 'Samir Das', role: 'Engineering Lead', company: 'RocketPanda' },
          { quote: 'The reminder system prevents missed deadlines.', name: 'Nina Flores', role: 'Operations', company: 'Campfire Health' },
          { quote: 'Onboarding was super fast for our whole team.', name: 'Owen Carter', role: 'CEO', company: 'LaunchLoop' }
        ])
      }
    },
    {
      key: 'sarah-chen-design', vertical: 'portfolio', slug: 'sarah-chen-design', brandMode: 'minimal', businessType: 'creative-professional', recipeHint: 'creative-professional', pages: commonPages('portfolio'),
      data: (() => {
        const projects = Array.from({ length: 10 }, (_, i) => ({
          title: ['Fintech Mobile Banking', 'D2C Beauty Rebrand', 'Healthcare Patient Portal', 'Travel Booking Platform', 'SaaS Onboarding Flow', 'Creator Commerce App', 'Real Estate Search UX', 'AI Support Dashboard', 'Luxury Retail Site', 'Nonprofit Donation UX'][i],
          category: ['Product Design', 'Brand + UX', 'UX Research', 'Service Design', 'Growth UX', 'Mobile App', 'Web Platform', 'Dashboard UX', 'Ecommerce UX', 'Accessibility UX'][i],
          description: 'User-centered design solution balancing conversion, clarity, and brand voice.',
          image: sarahImages[i]
        }));
        return {
          name: 'Sarah Chen', industry: 'portfolio', businessType: 'creative-professional', brandMode: 'minimal',
          hero_headline: 'Sarah Chen', hero_subheadline: 'UI/UX Designer & Brand Strategist',
          title: 'UI/UX Designer & Brand Strategist',
          bio: 'I design digital products and brand systems that turn complexity into clarity. My process combines deep user research, rigorous product thinking, and visual storytelling.\n\nOver the last decade, I have partnered with startups and enterprise teams to launch experiences that are elegant, accessible, and measurable.',
          description: 'Independent product designer focused on SaaS, fintech, and ecommerce experiences.',
          pages: commonPages('portfolio'), images: sarahImages,
          email: 'hello@sarahchen.design', phone: '(415) 555-0168', address: 'Mission District', city: 'San Francisco', state: 'CA', zip: '94110',
          socialLinks: { linkedin: 'https://linkedin.com/in/sarahchen', instagram: 'https://instagram.com/sarahchendesign', twitter: 'https://x.com/sarahchendesign' },
          skills: ['Product Strategy', 'Design Systems', 'Prototyping', 'User Research', 'UX Writing', 'Brand Identity'],
          experience: [
            { role: 'Lead Product Designer', company: 'Northscale', period: '2022-Present' },
            { role: 'Senior UX Designer', company: 'Helio Financial', period: '2018-2022' },
            { role: 'Digital Designer', company: 'Studio Loom', period: '2014-2018' }
          ],
          projects,
          ...flattenProjects(projects),
          ...flattenTestimonials([
            { quote: 'Sarah elevated our product and our brand in one engagement.', name: 'Amelia Cho', role: 'Founder', company: 'Northscale' },
            { quote: 'Her design thinking accelerated our roadmap decisions.', name: 'Rafael Perez', role: 'VP Product', company: 'Helio Financial' },
            { quote: 'Exceptional craft and strong collaboration with engineering.', name: 'Tess Monroe', role: 'Engineering Manager', company: 'Orbit Labs' },
            { quote: 'She turns ambiguous goals into clear, testable solutions.', name: 'Caleb Ward', role: 'CEO', company: 'Growthframe' }
          ])
        } as GeneratorData;
      })()
    },
    {
      key: 'marcus-photo', vertical: 'portfolio', slug: 'marcus-photo', brandMode: 'bold', businessType: 'talent-agency', recipeHint: 'talent-agency', pages: commonPages('portfolio'),
      data: (() => {
        const projects = Array.from({ length: 12 }, (_, i) => ({
          title: ['Brooklyn Rooftop Wedding', 'Editorial Street Portraits', 'Luxury Watch Campaign', 'Sunset Engagement Session', 'Studio Beauty Series', 'Concert Tour Visuals', 'Restaurant Brand Shoot', 'Architectural Interiors', 'Athleisure Lookbook', 'Lifestyle Family Session', 'Automotive Launch Event', 'Travel Documentary Series'][i],
          category: ['Weddings', 'Portrait', 'Commercial', 'Weddings', 'Portrait', 'Commercial', 'Commercial', 'Editorial', 'Fashion', 'Portrait', 'Commercial', 'Editorial'][i],
          description: 'A cinematic photography project focused on authentic emotion and premium composition.',
          image: marcusImages[i]
        }));
        return {
          name: 'Marcus Rivera Photography', industry: 'portfolio', businessType: 'talent-agency', brandMode: 'bold',
          hero_headline: 'Marcus Rivera Photography', hero_subheadline: 'Capturing Moments That Matter',
          tagline: 'Capturing Moments That Matter',
          description: 'Marcus Rivera is a New York based photographer specializing in weddings, portraits, and commercial storytelling.\n\nHis style blends editorial composition with documentary spontaneity to produce work that feels both cinematic and deeply human.',
          pages: commonPages('portfolio'), images: marcusImages,
          email: 'bookings@marcusrivera.photo', phone: '(917) 555-0144', address: '230 W 38th St', city: 'New York', state: 'NY', zip: '10018',
          socialLinks: { instagram: 'https://instagram.com/marcusriveraphoto', facebook: 'https://facebook.com/marcusriveraphoto', youtube: 'https://youtube.com/@marcusriveraphoto' },
          services: ['Wedding Photography', 'Editorial Portraits', 'Brand Campaigns', 'Event Coverage'],
          equipment: ['Sony A1', 'Canon R5', 'Profoto B10', 'DJI RS3'],
          projects,
          ...flattenProjects(projects),
          ...flattenTestimonials([
            { quote: 'He captured our wedding day with incredible emotion.', name: 'Emily & Jordan', role: 'Wedding Clients', company: 'NYC' },
            { quote: 'Marcus delivered campaign shots that drove engagement immediately.', name: 'Sofia Lane', role: 'Marketing Director', company: 'Axis Watches' },
            { quote: 'Fast turnaround and flawless quality across 3 shoot days.', name: 'Milo Grant', role: 'Creative Producer', company: 'Studio Pike' },
            { quote: 'Our portraits felt effortless and editorial at once.', name: 'Nora Fields', role: 'Model', company: 'Independent' },
            { quote: 'A true professional from planning to final delivery.', name: 'Derek Liu', role: 'Brand Manager', company: 'Trident Apparel' }
          ])
        } as GeneratorData;
      })()
    },
    {
      key: 'sparkle-cleaning', vertical: 'local-service', slug: 'sparkle-cleaning', brandMode: 'playful', businessType: 'home-services', recipeHint: 'home-services', pages: commonPages('local-service'),
      data: {
        name: 'Sparkle Cleaning Co.', industry: 'local-service', businessType: 'home-services', brandMode: 'playful',
        hero_headline: 'We Make Clean Look Easy', hero_subheadline: 'Reliable home and office cleaning with eco-friendly products and friendly pros.',
        description: 'Sparkle Cleaning Co. delivers consistent, detail-driven cleaning for homes, apartments, and small offices.\n\nOur vetted team uses safe, eco-conscious products and a proven checklist to leave every space fresh, healthy, and guest-ready.',
        pages: commonPages('local-service'), images: sparkleImages,
        email: 'bookings@sparklecleaning.co', phone: '(415) 555-0131', address: '840 Market Street', city: 'San Francisco', state: 'CA', zip: '94103',
        openingHours: { Monday: '8:00 AM - 6:00 PM', Tuesday: '8:00 AM - 6:00 PM', Wednesday: '8:00 AM - 6:00 PM', Thursday: '8:00 AM - 6:00 PM', Friday: '8:00 AM - 6:00 PM', Saturday: '9:00 AM - 4:00 PM', Sunday: 'Closed' },
        socialLinks: { facebook: 'https://facebook.com/sparklecleaningco', instagram: 'https://instagram.com/sparklecleaningco' },
        trust_badges: ['Licensed & Insured', 'Eco-Friendly Products', 'Background-Checked Staff'],
        ...flattenServices([
          { title: 'Standard Home Cleaning', description: 'Kitchen, bathrooms, bedrooms, and common areas.', price: '$129' },
          { title: 'Deep Cleaning', description: 'Top-to-bottom reset including baseboards and appliances.', price: '$229' },
          { title: 'Move-In / Move-Out Cleaning', description: 'Detailed turnover clean for new and former residents.', price: '$279' },
          { title: 'Office Cleaning', description: 'After-hours cleaning for small office spaces.', price: '$189' },
          { title: 'Post-Construction Cleanup', description: 'Dust removal and finishing polish after renovation.', price: '$349' },
          { title: 'Airbnb Turnover Service', description: 'Fast reset between guest bookings with linen swap.', price: '$149' }
        ]),
        team: [
          { name: 'Alyssa Kim', role: 'Operations Lead', bio: 'Coordinates scheduling and quality checks.' },
          { name: 'Diego Ramirez', role: 'Senior Cleaner', bio: 'Specialist in deep-clean and post-construction projects.' },
          { name: 'Monica Tran', role: 'Client Success', bio: 'Ensures every visit meets service expectations.' },
          { name: 'Rosa Martinez', role: 'Field Supervisor', bio: 'Leads teams and training on-site.' }
        ],
        ...flattenTestimonials([
          { quote: 'Best cleaning team we have worked with in SF.', name: 'Olivia Reed', role: 'Homeowner', company: 'Pacific Heights' },
          { quote: 'They are punctual, friendly, and very thorough.', name: 'Ben Scott', role: 'Property Manager', company: 'CityNest Rentals' },
          { quote: 'Our office always looks spotless before clients arrive.', name: 'Janet Wu', role: 'Office Manager', company: 'BrightPath Legal' },
          { quote: 'Great communication and no hidden fees.', name: 'Mira Patel', role: 'Customer', company: 'Noe Valley' },
          { quote: 'Deep clean service was absolutely worth it.', name: 'Ibrahim Khan', role: 'Customer', company: 'SOMA' },
          { quote: 'Super reliable for Airbnb turnover.', name: 'Leah Cho', role: 'Host', company: 'Mission District' }
        ])
      }
    },
    {
      key: 'downtown-dental', vertical: 'local-service', slug: 'downtown-dental', brandMode: 'modern', businessType: 'wellness-services', recipeHint: 'wellness-services', pages: commonPages('local-service'),
      data: {
        name: 'Downtown Dental Care', industry: 'local-service', businessType: 'wellness-services', brandMode: 'modern',
        hero_headline: 'Your Smile, Our Priority', hero_subheadline: 'Comprehensive family dentistry with modern technology and compassionate care.',
        description: 'Downtown Dental Care provides preventive, cosmetic, and restorative treatments in a calm, patient-first environment.\n\nOur clinicians focus on education and long-term oral health so every visit feels clear, supportive, and stress-free.',
        pages: commonPages('local-service'), images: dentalImages,
        email: 'care@downtowndental.com', phone: '(312) 555-0163', address: '188 N Wabash Ave', city: 'Chicago', state: 'IL', zip: '60601',
        openingHours: { Monday: '8:00 AM - 5:00 PM', Tuesday: '8:00 AM - 5:00 PM', Wednesday: '8:00 AM - 6:00 PM', Thursday: '8:00 AM - 5:00 PM', Friday: '8:00 AM - 3:00 PM', Saturday: 'By Appointment', Sunday: 'Closed' },
        socialLinks: { facebook: 'https://facebook.com/downtowndentalcare', instagram: 'https://instagram.com/downtowndentalcare' },
        insurance_info: 'Accepted: Delta Dental, Cigna, Aetna, Guardian, MetLife. Payment plans available.',
        ...flattenServices([
          { title: 'Routine Exams & Cleanings', description: 'Preventive care with digital X-rays and oral screenings.' },
          { title: 'Teeth Whitening', description: 'In-office and take-home whitening options.' },
          { title: 'Invisalign', description: 'Clear aligner treatment planning and follow-up.' },
          { title: 'Dental Implants', description: 'Single and multi-tooth implant restoration.' },
          { title: 'Porcelain Veneers', description: 'Cosmetic smile enhancement with natural finish.' },
          { title: 'Emergency Dentistry', description: 'Same-day urgent care for pain and trauma.' },
          { title: 'Pediatric Dentistry', description: 'Gentle care for children and teens.' },
          { title: 'Root Canal Therapy', description: 'Comfort-focused endodontic treatment.' }
        ]),
        team: [
          { name: 'Dr. Hannah Lee, DDS', role: 'Lead Dentist', bio: 'Specializes in restorative and cosmetic dentistry.' },
          { name: 'Dr. Miguel Santos, DMD', role: 'Associate Dentist', bio: 'Focus on preventive and family dental care.' },
          { name: 'Emily Rogers', role: 'Hygienist', bio: 'Patient education and preventive treatment.' },
          { name: 'Tara Bennett', role: 'Dental Assistant', bio: 'Supports chairside procedures and comfort.' },
          { name: 'Rina Patel', role: 'Front Desk Coordinator', bio: 'Scheduling and insurance support.' }
        ],
        ...flattenTestimonials([
          { quote: 'The most comfortable dental experience I have had.', name: 'Alyson Price', role: 'Patient', company: 'Chicago' },
          { quote: 'Staff explained every step clearly and patiently.', name: 'Marcus Bell', role: 'Patient', company: 'Loop District' },
          { quote: 'Flexible scheduling and excellent clinical care.', name: 'Dina Shah', role: 'Patient', company: 'West Loop' },
          { quote: 'My Invisalign progress has been fantastic.', name: 'Jordan Wright', role: 'Patient', company: 'River North' },
          { quote: 'Highly professional and very friendly team.', name: 'Nora Fields', role: 'Patient', company: 'Streeterville' }
        ])
      }
    },
    {
      key: 'artisan-goods-co', vertical: 'ecommerce', slug: 'artisan-goods-co', brandMode: 'minimal', businessType: 'artisan', recipeHint: 'artisan-shop', pages: commonPages('ecommerce'),
      data: (() => {
        const products = Array.from({ length: 15 }, (_, i) => ({
          title: ['Hand-Thrown Clay Mug', 'Linen Table Runner', 'Olivewood Serving Board', 'Woven Market Tote', 'Stoneware Dinner Plate', 'Brass Candle Holder', 'Hand-Dyed Throw Blanket', 'Ceramic Pour-Over Set', 'Natural Beeswax Candle', 'Reclaimed Wood Frame', 'Artisan Tea Cup Set', 'Knotted Cotton Basket', 'Minimalist Brass Spoon', 'Textured Vase', 'Handwoven Wall Hanging'][i],
          price: [`$28`, `$34`, `$42`, `$46`, `$31`, `$29`, `$78`, `$64`, `$18`, `$36`, `$40`, `$27`, `$16`, `$52`, `$68`][i],
          description: 'Small-batch handcrafted piece made by local artisans with sustainable materials.',
          image: artisanImages[i]
        }));
        const categories = [
          { name: 'Ceramics', image: artisanImages[0] },
          { name: 'Textiles', image: artisanImages[1] },
          { name: 'Jewelry', image: artisanImages[2] },
          { name: 'Home Decor', image: artisanImages[3] }
        ];
        return {
          name: 'Artisan Goods Co.', store_name: 'Artisan Goods Co.', industry: 'ecommerce', businessType: 'artisan', brandMode: 'minimal',
          hero_headline: 'Handcrafted With Love', hero_subheadline: 'Curated goods from independent makers and local studios.',
          tagline: 'Handcrafted With Love',
          description: 'Artisan Goods Co. partners with local makers to bring timeless, small-batch pieces to modern homes. Every item is ethically produced, thoughtfully sourced, and designed to last.\n\nWe believe in slow commerce: fewer, better objects with meaningful stories behind each craft tradition.',
          brand_story: 'Founded to support independent craftspeople, our shop features ceramics, textiles, and jewelry made with low-waste methods and fair compensation.',
          pages: commonPages('ecommerce'), images: artisanImages,
          email: 'support@artisangoods.co', phone: '(503) 555-0171', address: '1124 SE Division St', city: 'Portland', state: 'OR', zip: '97202',
          socialLinks: { instagram: 'https://instagram.com/artisangoodsco', facebook: 'https://facebook.com/artisangoodsco' },
          ...flattenCategories(categories),
          ...flattenProducts(products),
          ...flattenTestimonials([
            { quote: 'Beautiful quality and thoughtful packaging.', name: 'Claire Murphy', role: 'Customer', company: 'Portland' },
            { quote: 'Every product feels personal and unique.', name: 'Jared Knox', role: 'Customer', company: 'Seattle' },
            { quote: 'My go-to store for meaningful gifts.', name: 'Talia Reed', role: 'Customer', company: 'San Diego' },
            { quote: 'The ceramics are stunning in person.', name: 'Nina Hart', role: 'Customer', company: 'Austin' }
          ])
        } as GeneratorData;
      })()
    },
    {
      key: 'urban-streetwear', vertical: 'ecommerce', slug: 'urban-streetwear', brandMode: 'bold', businessType: 'fashion', recipeHint: 'boutique-store', pages: commonPages('ecommerce'),
      data: (() => {
        const products = Array.from({ length: 16 }, (_, i) => ({
          title: ['Oversized Graphic Tee', 'Cargo Utility Pants', 'Tech Fleece Hoodie', 'Retro Court Sneakers', 'Monochrome Bomber', 'Street Logo Cap', 'Utility Crossbody Bag', 'Layered Chain Set', 'Distressed Denim Jacket', 'Wide-Leg Track Pants', 'Mesh Performance Tee', 'Chunky Sole Trainers', 'Ribbed Knit Beanie', 'Reflective Windbreaker', 'Leather High-Tops', 'Athletic Crew Socks'][i],
          price: [`$48`, `$72`, `$84`, `$110`, `$128`, `$36`, `$42`, `$30`, `$138`, `$76`, `$44`, `$120`, `$24`, `$96`, `$132`, `$18`][i],
          description: 'Premium streetwear piece engineered for all-day comfort and standout style.',
          image: urbanImages[i]
        }));
        const categories = [
          { name: 'Tops', image: urbanImages[0] },
          { name: 'Bottoms', image: urbanImages[1] },
          { name: 'Accessories', image: urbanImages[2] },
          { name: 'Footwear', image: urbanImages[3] }
        ];
        return {
          name: 'Urban Streetwear', store_name: 'Urban Streetwear', industry: 'ecommerce', businessType: 'fashion', brandMode: 'bold',
          hero_headline: 'Street Style, Elevated', hero_subheadline: 'Drop-ready fits inspired by city culture, music, and movement.',
          tagline: 'Street Style, Elevated',
          description: 'Urban Streetwear delivers limited-run apparel that fuses performance fabrics with bold silhouettes. Designed for creators and trend leaders, our collections blend utility with statement details.\n\nFrom daily essentials to release-day heat, every drop is built to stand out on the street.',
          brand_story: 'Built by a collective of designers and stylists, Urban Streetwear launches capsule collections rooted in city energy and modern tailoring.',
          pages: commonPages('ecommerce'), images: urbanImages,
          email: 'support@urbanstreetwear.com', phone: '(213) 555-0158', address: '742 S Broadway', city: 'Los Angeles', state: 'CA', zip: '90014',
          socialLinks: { instagram: 'https://instagram.com/urbanstreetwear', tiktok: 'https://tiktok.com/@urbanstreetwear', twitter: 'https://x.com/urbanstreetwear' },
          ...flattenCategories(categories),
          ...flattenProducts(products),
          ...flattenTestimonials([
            { quote: 'The quality and fit are unmatched.', name: 'Andre Cole', role: 'Customer', company: 'Los Angeles' },
            { quote: 'Every drop feels exclusive and fresh.', name: 'Mia Santos', role: 'Stylist', company: 'Street House' },
            { quote: 'Fast shipping and premium packaging.', name: 'Tyler Knox', role: 'Customer', company: 'San Jose' },
            { quote: 'My favorite streetwear brand this year.', name: 'Zoe Kim', role: 'Creator', company: 'YouTube' },
            { quote: 'The bomber jacket is instantly iconic.', name: 'Devin Ross', role: 'Customer', company: 'Phoenix' }
          ])
        } as GeneratorData;
      })()
    }
  ];
})();

async function verifyTheme(theme: ShowcaseTheme, themeDir: string, zipPath: string): Promise<void> {
  const templatesDir = path.join(themeDir, 'templates');
  const pageTemplates = (await fs.readdir(templatesDir)).filter((file) => file.startsWith('page-') && file.endsWith('.html'));

  if (pageTemplates.length < theme.pages.length) {
    throw new Error(`${theme.slug}: expected >= ${theme.pages.length} page templates, got ${pageTemplates.length}`);
  }

  for (const page of theme.pages) {
    const filePath = path.join(templatesDir, `page-${page.slug}.html`);
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`${theme.slug}: missing template ${path.basename(filePath)}`);
    }
  }

  const headerPath = path.join(themeDir, 'parts', 'header.html');
  const header = await fs.readFile(headerPath, 'utf8');
  for (const page of theme.pages) {
    if (!header.includes(page.title)) {
      throw new Error(`${theme.slug}: header missing nav label ${page.title}`);
    }
  }

  const footerMarker = '<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';
  for (const page of theme.pages) {
    const templateName = `page-${page.slug}.html`;
    const html = await fs.readFile(path.join(templatesDir, templateName), 'utf8');
    if (!html.includes(footerMarker)) {
      throw new Error(`${theme.slug}: ${templateName} missing footer template-part`);
    }
  }

  const filesToScan: string[] = [];
  const queue = [path.join(themeDir, 'templates'), path.join(themeDir, 'patterns')];
  while (queue.length > 0) {
    const dir = queue.shift()!;
    if (!(await fs.pathExists(dir))) continue;
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        queue.push(fullPath);
      } else if (entry.endsWith('.html') || entry.endsWith('.php')) {
        filesToScan.push(fullPath);
      }
    }
  }

  const allMarkup = (await Promise.all(filesToScan.map((file) => fs.readFile(file, 'utf8')))).join('\n');
  const imageMatches = allMarkup.match(/https?:\/\/(?:source\.unsplash\.com|images\.unsplash\.com|picsum\.photos)[^"'\s)]*/g) || [];
  if (imageMatches.length < 8) {
    throw new Error(`${theme.slug}: expected at least 8 image URLs in generated markup, got ${imageMatches.length}`);
  }

  const zipStats = await fs.stat(zipPath);
  if (zipStats.size < 50_000) {
    throw new Error(`${theme.slug}: ZIP too small (${zipStats.size} bytes)`);
  }
}

async function main(): Promise<void> {
  await fs.ensureDir(SHOWCASE_ROOT);
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(ZIPS_DIR);

  const report: Array<Record<string, string | number>> = [];

  for (const theme of themes) {
    const verticalDir = path.join(SHOWCASE_ROOT, theme.vertical);
    await fs.ensureDir(verticalDir);

    const dataFile = path.join(DATA_DIR, `${theme.key}.json`);
    await fs.writeJson(dataFile, {
      vertical: theme.vertical,
      recipe: theme.recipeHint,
      brandMode: theme.brandMode,
      slug: theme.slug,
      data: theme.data,
    }, { spaces: 2 });

    const result = await generateTheme({
      mode: 'standard',
      brandMode: theme.brandMode,
      slug: theme.slug,
      outDir: verticalDir,
      data: theme.data,
    });

    if (result.status !== 'success') {
      throw new Error(`Generation failed for ${theme.slug}`);
    }

    const zipOut = path.join(ZIPS_DIR, `${theme.slug}.zip`);
    await fs.copy(result.downloadPath, zipOut, { overwrite: true });

    const themeDir = path.join(verticalDir, theme.slug);
    await verifyTheme(theme, themeDir, zipOut);

    report.push({
      vertical: theme.vertical,
      theme: theme.slug,
      brandMode: theme.brandMode,
      pages: theme.pages.length,
      zip: path.relative(ROOT, zipOut),
      recipe: theme.recipeHint,
    });
  }

  console.table(report);
  console.log(`\nShowcase generation complete. Output: ${path.relative(ROOT, SHOWCASE_ROOT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

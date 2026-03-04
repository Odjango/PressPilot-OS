# Token Specification Draft

> This is a STARTING POINT for Task 1.1. The agent should expand and refine this into the full TOKEN_SPEC.md and token-schema.json during Phase 1.

---

## Token Naming Convention

- All tokens use `UPPER_SNAKE_CASE`
- Wrapped in double curly braces: `{{TOKEN_NAME}}`
- Numbered variants use `_N` suffix: `{{FEATURE_1_TITLE}}`, `{{FEATURE_2_TITLE}}`
- Image tokens prefixed with `IMAGE_`: `{{IMAGE_HERO}}`

---

## Hero Section Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{HERO_PRETITLE}}` | text | 60 | Eyebrow text above headline | "Authentic Italian Since 1985" |
| `{{HERO_TITLE}}` | text | 80 | Main headline | "The Best Pizza in New York" |
| `{{HERO_TEXT}}` | text | 200 | Subheadline / description | "Hand-tossed dough, fresh ingredients, and recipes passed down through generations." |
| `{{HERO_CTA}}` | text | 30 | Primary button text | "View Our Menu" |
| `{{HERO_CTA_URL}}` | url | 200 | Primary button link | "/menu" |
| `{{HERO_CTA_SECONDARY}}` | text | 30 | Secondary button text | "Learn More" |
| `{{IMAGE_HERO}}` | image | 500 | Hero background/feature image URL | "/assets/images/hero.jpg" |

## Features / Services Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{FEATURES_TITLE}}` | text | 80 | Section heading | "Why Choose Us" |
| `{{FEATURES_TEXT}}` | text | 200 | Section intro text | "We bring decades of experience to every dish." |
| `{{FEATURE_1_TITLE}}` | text | 50 | Feature 1 heading | "Fresh Ingredients" |
| `{{FEATURE_1_TEXT}}` | text | 150 | Feature 1 description | "Locally sourced produce and imported Italian cheeses." |
| `{{FEATURE_2_TITLE}}` | text | 50 | Feature 2 heading | "Wood-Fired Oven" |
| `{{FEATURE_2_TEXT}}` | text | 150 | Feature 2 description | "Traditional brick oven reaching 900°F for the perfect crust." |
| `{{FEATURE_3_TITLE}}` | text | 50 | Feature 3 heading | "Family Recipes" |
| `{{FEATURE_3_TEXT}}` | text | 150 | Feature 3 description | "Recipes passed down through four generations." |
| `{{FEATURE_4_TITLE}}` | text | 50 | Feature 4 heading | (Optional) |
| `{{FEATURE_4_TEXT}}` | text | 150 | Feature 4 description | (Optional) |
| `{{FEATURE_5_TITLE}}` | text | 50 | Feature 5 heading | (Optional) |
| `{{FEATURE_5_TEXT}}` | text | 150 | Feature 5 description | (Optional) |
| `{{FEATURE_6_TITLE}}` | text | 50 | Feature 6 heading | (Optional) |
| `{{FEATURE_6_TEXT}}` | text | 150 | Feature 6 description | (Optional) |
| `{{IMAGE_FEATURE_1}}` | image | 500 | Feature 1 image | "/assets/images/feature-1.jpg" |
| `{{IMAGE_FEATURE_2}}` | image | 500 | Feature 2 image | "/assets/images/feature-2.jpg" |
| `{{IMAGE_FEATURE_3}}` | image | 500 | Feature 3 image | "/assets/images/feature-3.jpg" |

## About Section Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{ABOUT_TITLE}}` | text | 80 | About section heading | "Our Story" |
| `{{ABOUT_TEXT}}` | text | 500 | About paragraph | "Founded in 1985 by the Rossi family..." |
| `{{ABOUT_MISSION}}` | text | 200 | Mission statement | "To bring authentic Italian flavors to every table." |
| `{{IMAGE_ABOUT}}` | image | 500 | About section image | "/assets/images/about.jpg" |

## Team Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{TEAM_TITLE}}` | text | 80 | Team section heading | "Meet Our Team" |
| `{{TEAM_1_NAME}}` | text | 50 | Team member 1 name | "Marco Rossi" |
| `{{TEAM_1_ROLE}}` | text | 50 | Team member 1 role | "Head Chef" |
| `{{TEAM_1_BIO}}` | text | 150 | Team member 1 bio | "20 years of culinary experience." |
| `{{IMAGE_TEAM_1}}` | image | 500 | Team member 1 photo | "/assets/images/team-1.jpg" |
| `{{TEAM_2_NAME}}` | text | 50 | Team member 2 name | "Sofia Rossi" |
| `{{TEAM_2_ROLE}}` | text | 50 | Team member 2 role | "Pastry Chef" |
| `{{TEAM_2_BIO}}` | text | 150 | Team member 2 bio | (Similar) |
| `{{IMAGE_TEAM_2}}` | image | 500 | Team member 2 photo | (Similar) |
| `{{TEAM_3_NAME}}` | text | 50 | (Repeat pattern for 3-4 members) | |
| `{{TEAM_3_ROLE}}` | text | 50 | | |
| `{{TEAM_4_NAME}}` | text | 50 | | |
| `{{TEAM_4_ROLE}}` | text | 50 | | |

## Testimonial Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{TESTIMONIALS_TITLE}}` | text | 80 | Section heading | "What Our Customers Say" |
| `{{TESTIMONIAL_1_TEXT}}` | text | 300 | Review text | "Best pizza I've ever had!" |
| `{{TESTIMONIAL_1_AUTHOR}}` | text | 50 | Reviewer name | "James Wilson" |
| `{{TESTIMONIAL_1_ROLE}}` | text | 50 | Reviewer context | "Food Blogger" |
| `{{TESTIMONIAL_2_TEXT}}` | text | 300 | (Repeat x3) | |
| `{{TESTIMONIAL_2_AUTHOR}}` | text | 50 | | |
| `{{TESTIMONIAL_3_TEXT}}` | text | 300 | | |
| `{{TESTIMONIAL_3_AUTHOR}}` | text | 50 | | |

## Contact Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{CONTACT_TITLE}}` | text | 80 | Section heading | "Get In Touch" |
| `{{CONTACT_TEXT}}` | text | 200 | Intro text | "We'd love to hear from you." |
| `{{CONTACT_EMAIL}}` | text | 100 | Email address | "info@romapizza.com" |
| `{{CONTACT_PHONE}}` | text | 30 | Phone number | "(212) 555-0123" |
| `{{CONTACT_ADDRESS}}` | text | 200 | Physical address | "123 Main Street, New York, NY 10001" |
| `{{CONTACT_HOURS}}` | text | 200 | Business hours | "Mon-Sat: 11am-10pm, Sun: 12pm-9pm" |

## Pricing Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{PRICING_TITLE}}` | text | 80 | Section heading | "Our Plans" |
| `{{PRICING_TEXT}}` | text | 200 | Intro text | "Choose the plan that fits your needs." |
| `{{PLAN_1_NAME}}` | text | 30 | Plan name | "Starter" |
| `{{PLAN_1_PRICE}}` | text | 20 | Price display | "$9/mo" |
| `{{PLAN_1_FEATURES}}` | text | 300 | Feature list (comma-separated) | "5 Pages, Basic SEO, Email Support" |
| `{{PLAN_1_CTA}}` | text | 30 | Button text | "Get Started" |
| `{{PLAN_2_NAME}}` | text | 30 | (Repeat x3) | "Professional" |
| `{{PLAN_2_PRICE}}` | text | 20 | | "$29/mo" |
| `{{PLAN_3_NAME}}` | text | 30 | | "Enterprise" |
| `{{PLAN_3_PRICE}}` | text | 20 | | "$99/mo" |

## CTA Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{CTA_TITLE}}` | text | 80 | CTA heading | "Ready to Get Started?" |
| `{{CTA_TEXT}}` | text | 200 | CTA description | "Join thousands of happy customers." |
| `{{CTA_BUTTON}}` | text | 30 | Button text | "Contact Us Today" |
| `{{CTA_BUTTON_URL}}` | url | 200 | Button link | "/contact" |

## Header / Footer Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{BUSINESS_NAME}}` | text | 80 | Site/business name | "Roma Pizza" |
| `{{FOOTER_TEXT}}` | text | 200 | Footer description | "Serving authentic Italian cuisine since 1985." |
| `{{FOOTER_COPYRIGHT}}` | text | 100 | Copyright line | "© 2026 Roma Pizza. All rights reserved." |
| `{{NAV_ITEMS}}` | special | — | Navigation items (handled by assembler, not token injection) | — |

## Restaurant-Specific Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{MENU_TITLE}}` | text | 80 | Menu page heading | "Our Menu" |
| `{{MENU_SECTION_1_TITLE}}` | text | 50 | Menu category | "Appetizers" |
| `{{MENU_ITEM_1_NAME}}` | text | 50 | Dish name | "Bruschetta" |
| `{{MENU_ITEM_1_DESC}}` | text | 150 | Dish description | "Toasted bread with fresh tomatoes and basil." |
| `{{MENU_ITEM_1_PRICE}}` | text | 15 | Price | "$12.99" |
| `{{MENU_ITEM_2_NAME}}` | text | 50 | (Repeat x8-10 per section) | |
| `{{MENU_SECTION_2_TITLE}}` | text | 50 | | "Main Courses" |
| `{{OPENING_HOURS}}` | text | 300 | Hours of operation | "Mon-Thu: 11am-9pm..." |
| `{{RESERVATION_TITLE}}` | text | 80 | Reservation heading | "Make a Reservation" |
| `{{RESERVATION_TEXT}}` | text | 200 | Reservation description | "Book your table online or call us." |

## Blog Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{BLOG_TITLE}}` | text | 80 | Blog section heading | "Latest News" |
| `{{BLOG_INTRO}}` | text | 200 | Blog section intro | "Stay updated with our latest stories." |

## Newsletter Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{NEWSLETTER_TITLE}}` | text | 80 | Newsletter heading | "Stay in the Loop" |
| `{{NEWSLETTER_TEXT}}` | text | 200 | Newsletter description | "Subscribe for exclusive offers." |
| `{{NEWSLETTER_BUTTON}}` | text | 30 | Subscribe button | "Subscribe" |

## FAQ Tokens

| Token | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `{{FAQ_TITLE}}` | text | 80 | FAQ heading | "Frequently Asked Questions" |
| `{{FAQ_1_QUESTION}}` | text | 100 | Question 1 | "Do you offer delivery?" |
| `{{FAQ_1_ANSWER}}` | text | 300 | Answer 1 | "Yes, we deliver within a 5-mile radius." |
| `{{FAQ_2_QUESTION}}` | text | 100 | (Repeat x5-6) | |
| `{{FAQ_2_ANSWER}}` | text | 300 | | |

---

## Notes for the Agent

- This draft has ~85 tokens. Expand to 70-80 unique base tokens in the final spec.
- Numbered tokens (FEATURE_1, FEATURE_2, etc.) count as separate tokens.
- Some patterns need fewer tokens than listed — the `required_tokens` field in registry.json handles this.
- Image tokens should default to placeholder URLs if no image is provided.
- Restaurant tokens are ONLY required when vertical = restaurant.

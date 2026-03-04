# PressPilot SSWG Token Specification

> Canonical token vocabulary for pattern assembly. Tokens are **UPPER_SNAKE_CASE** and always wrapped in `{{...}}`.
> Replace **text content only** (never touch block comments, classes, inline styles, or HTML structure).

## Rules
- Tokens appear **only** in source pattern files; final output contains zero tokens.
- Allowed replacements: text nodes inside `<p>`, `<h1>`–`<h6>`, `<a>`, `<span>`, `<li>`, button text, and `alt=""` attributes.
- Never change anything inside `<!-- wp:blockname { ... } -->` comments.

---

## Hero (8 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{HERO_PRETITLE}}` | text | 60 | Eyebrow/pretitle text | "Family-owned since 1985" |
| `{{HERO_TITLE}}` | text | 80 | Main headline | "The Best Pizza in Brooklyn" |
| `{{HERO_TEXT}}` | text | 200 | Supporting copy | "Hand-tossed dough, fresh ingredients." |
| `{{HERO_CTA}}` | text | 30 | Primary button | "View Menu" |
| `{{HERO_CTA_URL}}` | url | 2048 | Primary button link | "/menu" |
| `{{HERO_CTA_SECONDARY}}` | text | 30 | Secondary button | "Learn More" |
| `{{HERO_CTA_SECONDARY_URL}}` | url | 2048 | Secondary link | "/about" |
| `{{IMAGE_HERO}}` | image | 2048 | Hero image URL | "https://.../hero.jpg" |

## Features / Services (10 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{FEATURES_TITLE}}` | text | 80 | Section heading | "Why Choose Us" |
| `{{FEATURES_TEXT}}` | text | 200 | Intro paragraph | "Three reasons customers love us." |
| `{{FEATURE_1_TITLE}}` | text | 60 | Feature 1 title | "Fresh Ingredients" |
| `{{FEATURE_1_TEXT}}` | text | 150 | Feature 1 copy | "Local produce and artisan cheeses." |
| `{{FEATURE_2_TITLE}}` | text | 60 | Feature 2 title | "Wood-Fired Oven" |
| `{{FEATURE_2_TEXT}}` | text | 150 | Feature 2 copy | "900°F for the perfect crust." |
| `{{FEATURE_3_TITLE}}` | text | 60 | Feature 3 title | "Family Recipes" |
| `{{FEATURE_3_TEXT}}` | text | 150 | Feature 3 copy | "Passed down for generations." |
| `{{IMAGE_FEATURE_1}}` | image | 2048 | Feature image 1 | "https://.../feature-1.jpg" |
| `{{IMAGE_FEATURE_2}}` | image | 2048 | Feature image 2 | "https://.../feature-2.jpg" |

## About (5 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{ABOUT_TITLE}}` | text | 80 | Section heading | "Our Story" |
| `{{ABOUT_TEXT}}` | text | 400 | Main paragraph | "Founded in 1985..." |
| `{{ABOUT_MISSION}}` | text | 200 | Mission statement | "Serve authentic flavors daily." |
| `{{ABOUT_TAGLINE}}` | text | 120 | Short tagline | "Tradition meets craft." |
| `{{IMAGE_ABOUT}}` | image | 2048 | About image URL | "https://.../about.jpg" |

## Team (7 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{TEAM_TITLE}}` | text | 80 | Section heading | "Meet the Team" |
| `{{TEAM_TEXT}}` | text | 200 | Team intro copy | "Local experts at your service." |
| `{{TEAM_1_NAME}}` | text | 60 | Member 1 name | "Marco Rossi" |
| `{{TEAM_1_ROLE}}` | text | 60 | Member 1 role | "Head Chef" |
| `{{IMAGE_TEAM_1}}` | image | 2048 | Member 1 photo | "https://.../team-1.jpg" |
| `{{TEAM_2_NAME}}` | text | 60 | Member 2 name | "Sofia Rossi" |
| `{{IMAGE_TEAM_2}}` | image | 2048 | Member 2 photo | "https://.../team-2.jpg" |

## Testimonials (7 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{TESTIMONIALS_TITLE}}` | text | 80 | Section heading | "What Customers Say" |
| `{{TESTIMONIAL_1_TEXT}}` | text | 300 | Testimonial 1 text | "Best pizza in the city." |
| `{{TESTIMONIAL_1_AUTHOR}}` | text | 60 | Testimonial 1 name | "James Wilson" |
| `{{TESTIMONIAL_1_ROLE}}` | text | 60 | Testimonial 1 context | "Food Blogger" |
| `{{TESTIMONIAL_2_TEXT}}` | text | 300 | Testimonial 2 text | "Friendly staff and fast service." |
| `{{TESTIMONIAL_2_AUTHOR}}` | text | 60 | Testimonial 2 name | "Lena Ortiz" |
| `{{IMAGE_TESTIMONIAL_1}}` | image | 2048 | Testimonial avatar | "https://.../avatar.jpg" |

## Contact (6 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{CONTACT_TITLE}}` | text | 80 | Section heading | "Get In Touch" |
| `{{CONTACT_TEXT}}` | text | 200 | Intro text | "We’d love to hear from you." |
| `{{CONTACT_EMAIL}}` | text | 254 | Email address | "hello@romapizza.com" |
| `{{CONTACT_PHONE}}` | text | 30 | Phone number | "(212) 555-0123" |
| `{{CONTACT_ADDRESS}}` | text | 200 | Street address | "123 Main St" |
| `{{CONTACT_STATE}}` | text | 60 | State/region | "NY" |

## Pricing (10 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{PRICING_TITLE}}` | text | 80 | Section heading | "Plans & Pricing" |
| `{{PRICING_TEXT}}` | text | 200 | Intro copy | "Choose the plan that fits." |
| `{{PLAN_1_NAME}}` | text | 40 | Plan 1 name | "Starter" |
| `{{PLAN_1_PRICE}}` | text | 20 | Plan 1 price | "$19/mo" |
| `{{PLAN_1_FEATURES}}` | text | 200 | Plan 1 features | "5 pages, basic SEO" |
| `{{PLAN_1_CTA}}` | text | 30 | Plan 1 CTA | "Get Started" |
| `{{PLAN_2_NAME}}` | text | 40 | Plan 2 name | "Professional" |
| `{{PLAN_2_PRICE}}` | text | 20 | Plan 2 price | "$49/mo" |
| `{{PLAN_2_FEATURES}}` | text | 200 | Plan 2 features | "Unlimited pages" |
| `{{PLAN_2_CTA}}` | text | 30 | Plan 2 CTA | "Upgrade" |

## CTA (3 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{CTA_TITLE}}` | text | 80 | CTA heading | "Ready to get started?" |
| `{{CTA_TEXT}}` | text | 200 | CTA copy | "Book your table today." |
| `{{CTA_BUTTON}}` | text | 30 | CTA button | "Contact Us" |

## Blog (1 token)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{BLOG_TITLE}}` | text | 80 | Section heading | "Latest News" |

## Header/Footer + Social (6 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{BUSINESS_NAME}}` | text | 80 | Business/site name | "Roma Pizza" |
| `{{FOOTER_TEXT}}` | text | 200 | Footer summary | "Serving authentic Italian cuisine." |
| `{{FOOTER_COPYRIGHT}}` | text | 120 | Copyright line | "© 2026 Roma Pizza" |
| `{{SOCIAL_FACEBOOK}}` | url | 2048 | Facebook URL | "https://facebook.com/roma" |
| `{{SOCIAL_INSTAGRAM}}` | url | 2048 | Instagram URL | "https://instagram.com/roma" |
| `{{SOCIAL_TWITTER}}` | url | 2048 | Twitter/X URL | "https://x.com/roma" |

## Restaurant (8 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{MENU_TITLE}}` | text | 80 | Menu section heading | "Our Menu" |
| `{{MENU_SECTION_1_TITLE}}` | text | 60 | Menu category | "Appetizers" |
| `{{MENU_ITEM_1_NAME}}` | text | 60 | Item name | "Bruschetta" |
| `{{MENU_ITEM_1_DESC}}` | text | 150 | Item description | "Tomato, basil, olive oil." |
| `{{MENU_ITEM_1_PRICE}}` | text | 20 | Item price | "$12" |
| `{{OPENING_HOURS}}` | text | 200 | Hours of operation | "Mon–Sun 11am–9pm" |
| `{{RESERVATION_TITLE}}` | text | 80 | Reservation heading | "Reserve a Table" |
| `{{RESERVATION_TEXT}}` | text | 200 | Reservation copy | "Call or book online." |

## Gallery Images (3 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{IMAGE_GALLERY_1}}` | image | 2048 | Gallery image 1 | "https://.../gallery-1.jpg" |
| `{{IMAGE_GALLERY_2}}` | image | 2048 | Gallery image 2 | "https://.../gallery-2.jpg" |
| `{{IMAGE_GALLERY_3}}` | image | 2048 | Gallery image 3 | "https://.../gallery-3.jpg" |

## FAQ (3 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{FAQ_TITLE}}` | text | 80 | FAQ heading | "Frequently Asked Questions" |
| `{{FAQ_1_QUESTION}}` | text | 120 | FAQ question | "Do you offer delivery?" |
| `{{FAQ_1_ANSWER}}` | text | 300 | FAQ answer | "Yes, within a 5-mile radius." |

## Newsletter (3 tokens)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{NEWSLETTER_TITLE}}` | text | 80 | Newsletter heading | "Stay in the loop" |
| `{{NEWSLETTER_TEXT}}` | text | 200 | Newsletter text | "Subscribe for weekly updates." |
| `{{NEWSLETTER_BUTTON}}` | text | 30 | Subscribe button | "Subscribe" |

## Numbers/Stats (1 token)
| Token | Type | Max | Description | Example |
|------|------|-----|-------------|---------|
| `{{NUMBERS_TITLE}}` | text | 80 | Numbers section heading | "By the numbers" |

---

**Total tokens:** 81

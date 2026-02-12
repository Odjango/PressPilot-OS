# Restaurant Business Type — PressPilot Guide

> How PressPilot handles restaurant-specific features like reservations, menus, and contact pages.

---

## Generated Pages

When PressPilot generates a restaurant theme, it creates **4 pages** automatically on activation:

| Page | Template | Content |
|------|----------|---------|
| Home | `front-page.html` | Hero, features, testimonials, CTA |
| Menu | `page-menu.html` | Full menu with categories and prices |
| About | `page-about.html` | Restaurant story with image |
| Contact | `page-contact.html` | Reservation CTA with phone number |

---

## Reservation Handling

PressPilot generates a **Contact page** with a centered CTA section that includes:
- A headline (e.g., "Reserve Your Table")
- Supporting text about the dining experience
- The restaurant's phone number
- A "Book a Table" button linking to `/contact/`

### Why not a built-in booking form?

Reservation systems require real-time availability, payment processing, and calendar integrations that vary wildly between restaurants. Rather than generating a half-working form, PressPilot gives you a clean Contact page that you can enhance with any of the options below.

### Option 1: Booking Widget (Recommended)

Use a third-party reservation service that provides an embeddable widget:

| Service | WordPress Plugin | Free Tier |
|---------|-----------------|-----------|
| OpenTable | [OpenTable Widget](https://wordpress.org/plugins/flavor-flavor-widget/) | Yes (commission-based) |
| Resy | Embed via HTML block | No |
| Yelp Reservations | Embed via HTML block | Yes |
| TableAgent | [TableAgent Plugin](https://wordpress.org/plugins/flavor-flavor-widget/) | Yes |
| SimplyBook.me | [SimplyBook Plugin](https://wordpress.org/plugins/flavor-flavor-widget/) | Free tier available |

**How to add:**
1. Go to **Pages > Contact** in WordPress admin
2. Click below the existing CTA section
3. Add a **Custom HTML** block
4. Paste the embed code from your reservation service

### Option 2: Contact Form Plugin

Install a form plugin and add a reservation form to the Contact page:

| Plugin | Free | Features |
|--------|------|----------|
| WPForms Lite | Yes | Drag-and-drop builder, email notifications |
| Contact Form 7 | Yes | Lightweight, highly customizable |
| Formidable Forms | Yes (Lite) | Advanced fields, conditional logic |
| Gravity Forms | No ($59/yr) | Payment integration, advanced routing |

**Recommended fields for a reservation form:**
- Name (required)
- Email (required)
- Phone (required)
- Date (date picker)
- Time (dropdown: lunch/dinner slots)
- Party size (dropdown: 1-10+)
- Special requests (textarea, optional)

**How to add:**
1. Install your chosen form plugin
2. Create a new form with the fields above
3. Go to **Pages > Contact**
4. Add the form shortcode or block below the CTA section
5. Configure email notifications to go to the restaurant's email

### Option 3: Phone/Email Only

The simplest approach — keep the generated Contact page as-is. It already includes:
- The restaurant's phone number prominently displayed
- A CTA button that links to the Contact page
- The phone number is also in the footer

This works well for restaurants that prefer phone reservations or use a separate system entirely.

---

## Menu Page

The Menu page displays items organized by category (e.g., Appetizers, Main Courses, Desserts). Each item shows:
- **Name** — dish title
- **Description** — brief description of ingredients/preparation
- **Price** — formatted with currency symbol

### Editing the Menu

1. Go to **Pages > Menu** in WordPress admin
2. Click on any text to edit it directly
3. To add a new item, duplicate an existing item block group
4. To remove an item, select the block group and delete

### Menu Updates

The menu is static HTML — it doesn't pull from a database. For restaurants that update menus frequently, consider:
- **MenuPress plugin** — manages menus as a custom post type
- **PDF upload** — add a PDF menu link alongside the HTML menu
- **Manual editing** — update the page directly in Site Editor

---

## About Page

The About page uses a two-column layout:
- **Left column**: Restaurant name as title + two paragraphs of story text
- **Right column**: Restaurant/chef image with rounded corners

Edit this page at **Pages > About** to customize the story and image.

---

## Header Navigation

The header includes 4 navigation links and a CTA button:

| Nav Item | Links To |
|----------|----------|
| Home | `/` |
| Menu | `/menu/` |
| About | `/about/` |
| Contact | `/contact/` |
| Reserve Table (button) | `/contact/` |

---

## Footer

The restaurant footer includes:
- Business name and tagline
- Navigation links (Home, Menu, About, Contact)
- Address, phone, and email
- Business hours
- PressPilot credit

---

## FAQ

**Q: Can customers book reservations directly on the website?**
A: The generated theme includes a Contact page with phone number and CTA. To accept online reservations, add a booking widget (OpenTable, Resy) or a contact form plugin (WPForms, Contact Form 7) to the Contact page.

**Q: How do I update menu prices?**
A: Go to Pages > Menu in WordPress admin. Click on any price to edit it directly in the block editor.

**Q: Can I add more menu categories?**
A: Yes. In the Menu page editor, duplicate an existing category heading and item group, then update the text.

**Q: What if I want a full online ordering system?**
A: PressPilot themes are WooCommerce-compatible. Install WooCommerce, add your menu items as products, and link to the shop from your Menu page.

**Q: How do I change the hero image?**
A: Go to Appearance > Editor > Pages > Home. Click the hero section, select the cover block, and replace the background image.

---

## UI Tip (for PressPilot Generation Step)

> **Restaurant reservations:** Your theme includes a Contact page where customers can find your phone number and reach out to make a reservation. To accept online bookings, we recommend adding a reservation widget from OpenTable, Resy, or a WordPress form plugin like WPForms after installing your theme.

---

*Last updated: 2026-02-11*
